import request from 'supertest';
import app from '../src/app';

// Mock axios to prevent real API calls
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Assistant API', () => {
  describe('POST /api/assistant/chat', () => {
    it('should return 503 when GROQ_API_KEY is not set', async () => {
      const res = await request(app)
        .post('/api/assistant/chat')
        .send({ message: 'Hello', language: 'en' });

      expect(res.status).toBe(503);
      expect(res.body.code).toBe('AI_NOT_CONFIGURED');
    });

    it('should reject empty message', async () => {
      const res = await request(app)
        .post('/api/assistant/chat')
        .send({ message: '', language: 'en' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should reject whitespace-only message', async () => {
      const res = await request(app)
        .post('/api/assistant/chat')
        .send({ message: '   ', language: 'en' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should reject invalid language', async () => {
      const res = await request(app)
        .post('/api/assistant/chat')
        .send({ message: 'Hello', language: 'french' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should reject message exceeding max length', async () => {
      const longMessage = 'a'.repeat(2001);
      const res = await request(app)
        .post('/api/assistant/chat')
        .send({ message: longMessage, language: 'en' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should accept valid language options', async () => {
      for (const lang of ['en', 'ur', 'roman-urdu']) {
        const res = await request(app)
          .post('/api/assistant/chat')
          .send({ message: 'Hello', language: lang });

        // Should pass validation but get 503 (no key) — not 400
        expect(res.status).toBe(503);
      }
    });
  });
});
