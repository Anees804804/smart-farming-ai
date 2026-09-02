import request from 'supertest';
import app from '../src/app';
import { NewsUpdate } from '../src/models/NewsUpdate';

jest.mock('../src/models/NewsUpdate', () => ({
  NewsUpdate: {
    create: jest.fn(),
    find: jest.fn(),
  },
}));

const TEST_ADMIN_KEY = 'test-secret-key-123';

describe('News endpoints', () => {
  const originalAdminKey = process.env.ADMIN_KEY;

  beforeAll(() => {
    process.env.ADMIN_KEY = TEST_ADMIN_KEY;
  });

  afterAll(() => {
    process.env.ADMIN_KEY = originalAdminKey;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── POST /api/news ──────────────────────────────────────────────

  it('returns 401 when x-admin-key header is missing', async () => {
    const res = await request(app)
      .post('/api/news')
      .send({ title: 'Test', description: 'Desc', province: 'Punjab', category: 'news' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 when x-admin-key header is wrong', async () => {
    const res = await request(app)
      .post('/api/news')
      .set('x-admin-key', 'wrong-key')
      .send({ title: 'Test', description: 'Desc', province: 'Punjab', category: 'news' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('creates a news entry when admin key is valid', async () => {
    (NewsUpdate.create as jest.Mock).mockResolvedValue({
      title: 'New Scheme Launch',
      description: 'A new farming scheme for Punjab.',
      province: 'Punjab',
      category: 'scheme',
      createdAt: new Date('2026-08-31T00:00:00.000Z'),
    });

    const res = await request(app)
      .post('/api/news')
      .set('x-admin-key', TEST_ADMIN_KEY)
      .send({
        title: 'New Scheme Launch',
        description: 'A new farming scheme for Punjab.',
        province: 'Punjab',
        category: 'scheme',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.data.title).toBe('New Scheme Launch');
    expect(res.body.data.category).toBe('scheme');
    expect(res.body.data.imageUrl).toBeNull();
  });

  it('creates a news entry with imageUrl when provided', async () => {
    (NewsUpdate.create as jest.Mock).mockResolvedValue({
      title: 'Crop Fair 2026',
      description: 'Annual crop fair in Lahore.',
      province: 'Punjab',
      category: 'news',
      imageUrl: 'https://example.com/crop-fair.jpg',
      createdAt: new Date('2026-08-31T00:00:00.000Z'),
    });

    const res = await request(app)
      .post('/api/news')
      .set('x-admin-key', TEST_ADMIN_KEY)
      .send({
        title: 'Crop Fair 2026',
        description: 'Annual crop fair in Lahore.',
        province: 'Punjab',
        category: 'news',
        imageUrl: 'https://example.com/crop-fair.jpg',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.data.title).toBe('Crop Fair 2026');
    expect(res.body.data.imageUrl).toBe('https://example.com/crop-fair.jpg');
  });

  // ── GET /api/news ───────────────────────────────────────────────

  it('returns entries matching the requested province plus "all" entries', async () => {
    (NewsUpdate.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([
          {
            title: 'Punjab Specific News',
            description: 'Local news.',
            province: 'Punjab',
            category: 'news',
            imageUrl: 'https://example.com/local.jpg',
            createdAt: new Date('2026-08-31T00:00:00.000Z'),
          },
          {
            title: 'National Scheme',
            description: 'All-province scheme.',
            province: 'all',
            category: 'scheme',
            createdAt: new Date('2026-08-30T00:00:00.000Z'),
          },
        ]),
      }),
    });

    const res = await request(app).get('/api/news?province=Punjab');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].province).toBe('Punjab');
    expect(res.body.data[0].imageUrl).toBe('https://example.com/local.jpg');
    expect(res.body.data[1].province).toBe('all');
    expect(res.body.data[1].imageUrl).toBeNull();
  });
});
