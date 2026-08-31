import request from 'supertest';
import app from '../src/app';

describe('GET /api/health', () => {
  it('should return 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('smart-farming-api');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('environment');
  });

  it('should include dependencies object', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('dependencies');
    expect(res.body.dependencies).toHaveProperty('mongodb');
    expect(res.body.dependencies).toHaveProperty('ml');
    expect(res.body.dependencies).toHaveProperty('groq');
    expect(res.body.dependencies).toHaveProperty('weather');
  });

  it('should report groq as not_configured when no key', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.dependencies.groq).toBe('not_configured');
  });

  it('should report weather as not_configured when no key', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.dependencies.weather).toBe('not_configured');
  });
});
