import request from 'supertest';
import app from '../src/app';

jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;
import { env } from '../src/config/env';

describe('Disease ML API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('requires a disease image', async () => {
    const response = await request(app).post('/api/disease/detect');
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('IMAGE_REQUIRED');
  });

  it('proxies an in-memory disease upload', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {
      status: 'ok', data: { disease: 'Tomato - Healthy', confidence: 91, topPredictions: [] },
    } }).mockResolvedValueOnce({ data: { choices: [{ message: { content: 'This is a confirmed model result.' } }] } });
    env.groqApiKey = 'test-key';
    const response = await request(app).post('/api/disease/detect').field('crop', 'Tomato').attach('image', Buffer.from('image'), 'leaf.jpg');
    env.groqApiKey = '';
    expect(response.status).toBe(200);
    expect(response.body.data.disease).toBe('Tomato - Healthy');
    expect(response.body.status).toBe('ok');
    expect(response.body.explanation).toBe('This is a confirmed model result.');
    expect((mockedAxios.post.mock.calls[1][1] as any).messages[2].content).toContain('Tomato - Healthy');
    expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('/predict/disease'), expect.anything(), expect.objectContaining({ timeout: 30000 }));
  });

  it('marks a low-confidence model result and does not diagnose it', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {
      status: 'low_confidence', data: { disease: 'Tomato - Early blight', confidence: 42, topPredictions: [] },
    } }).mockResolvedValueOnce({ data: { choices: [{ message: { content: 'Please provide a clearer image.' } }] } });
    env.groqApiKey = 'test-key';
    const response = await request(app).post('/api/disease/detect').attach('image', Buffer.from('image'), 'leaf.jpg');
    env.groqApiKey = '';
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('low_confidence');
    expect(response.body.explanation).toBe('Please provide a clearer image.');
    expect((mockedAxios.post.mock.calls[1][1] as any).messages[2].content).not.toContain('"disease"');
  });

  it('uses the vision fallback for unsupported crops', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { choices: [{ message: { content: 'Visible leaf observation.' } }] } });
    env.groqApiKey = 'test-key';
    const response = await request(app).post('/api/disease/detect').field('crop', 'Cotton').attach('image', Buffer.from('image'), 'leaf.jpg');
    env.groqApiKey = '';
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('fallback_observation');
    expect(response.body.data).toEqual({ crop: 'Cotton', observation: 'Visible leaf observation.' });
  });
});