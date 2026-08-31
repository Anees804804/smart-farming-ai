import request from 'supertest';
import app from '../src/app';
import { FarmerRate } from '../src/models/FarmerRate';

jest.mock('../src/models/FarmerRate', () => ({
  FarmerRate: {
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
  },
}));

describe('Farmer rate endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects duplicate farmer rate submissions within 24 hours', async () => {
    (FarmerRate.findOne as jest.Mock).mockResolvedValue({
      phone: '03001234567',
      province: 'Punjab',
      crop: 'wheat',
      rate: 2600,
    });

    const res = await request(app)
      .post('/api/farmer-rates')
      .send({
        phone: '03001234567',
        province: 'Punjab',
        crop: 'wheat',
        rate: 2600,
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already submitted|spam prevention/i);
  });

  it('returns recent farmer rates without phone numbers for a province and crop', async () => {
    (FarmerRate.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([
          { province: 'Punjab', crop: 'wheat', rate: 2700, createdAt: new Date('2026-01-02T00:00:00.000Z') },
          { province: 'Punjab', crop: 'wheat', rate: 2650, createdAt: new Date('2026-01-01T00:00:00.000Z') },
        ]),
      }),
    });

    const res = await request(app).get('/api/farmer-rates?province=Punjab&crop=wheat');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).not.toHaveProperty('phone');
    expect(res.body.data[0].rate).toBe(2700);
  });
});
