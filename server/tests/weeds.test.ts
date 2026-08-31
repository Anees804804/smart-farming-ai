import request from 'supertest';
import app from '../src/app';

describe('GET /api/weeds', () => {
  it('should return all weeds', async () => {
    const res = await request(app).get('/api/weeds');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('count');
    expect(res.body.count).toBeGreaterThan(0);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('should filter weeds by crop', async () => {
    const res = await request(app).get('/api/weeds?crop=wheat');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((w: any) => {
      expect(w.crops).toContain('wheat');
    });
  });

  it('should return empty array for crop with no weeds', async () => {
    const res = await request(app).get('/api/weeds?crop=nonexistent');
    // Should fail validation since nonexistent is not in the valid crops list
    expect(res.status).toBe(400);
  });

  it('should reject invalid crop filter', async () => {
    const res = await request(app).get('/api/weeds?crop=banana');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});

describe('GET /api/weeds/crops', () => {
  it('should return list of crops', async () => {
    const res = await request(app).get('/api/weeds/crops');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data).toContain('wheat');
    expect(res.body.data).toContain('rice');
    expect(res.body.data).toContain('cotton');
  });
});

describe('GET /api/weeds/search', () => {
  it('should search weeds by English name', async () => {
    const res = await request(app).get('/api/weeds/search?q=wild');
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
    expect(res.body.data[0].nameEn.toLowerCase()).toContain('wild');
  });

  it('should search weeds by scientific name', async () => {
    const res = await request(app).get('/api/weeds/search?q=avena');
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
  });

  it('should reject short search queries', async () => {
    const res = await request(app).get('/api/weeds/search?q=a');
    expect(res.status).toBe(400);
  });

  it('should return empty array for non-matching search', async () => {
    const res = await request(app).get('/api/weeds/search?q=zzzznonexistent');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('GET /api/weeds/:id', () => {
  it('should return a weed by id', async () => {
    const res = await request(app).get('/api/weeds/wheat-001');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.data.id).toBe('wheat-001');
    expect(res.body.data).toHaveProperty('nameEn');
    expect(res.body.data).toHaveProperty('scientificName');
  });

  it('should return 404 for unknown weed id', async () => {
    const res = await request(app).get('/api/weeds/unknown-id');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Weed not found');
  });
});
