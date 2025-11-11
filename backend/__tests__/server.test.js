const request = require('supertest');
const app = require('../dist/server').default;  // JS compilado

describe('API STAC', () => {
  test('GET /api/stac/collections com params válidos', async () => {
    const res = await request(app).get('/api/stac/collections?lat=-15.7934&lng=-47.8822');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/stac/collections sem params', async () => {
    const res = await request(app).get('/api/stac/collections');
    expect(res.status).toBe(400);
  });
});

describe('API WTSS', () => {
  test('GET /api/wtss/timeseries com params válidos', async () => {
    const res = await request(app).get('/api/wtss/timeseries?lat=-15.7934&lng=-47.8822&coverage=S2-16D-2&bands=NDVI&start_date=2023-01-01&end_date=2023-12-31');
    expect(res.status).toBe(200);
    expect(res.body.timeline).toBeDefined();
    expect(res.body.values.NDVI).toBeDefined();
  });

  test('GET /api/wtss/timeseries sem bands', async () => {
    const res = await request(app).get('/api/wtss/timeseries?lat=-15.7934&lng=-47.8822&coverage=S2-16D-2');
    expect(res.status).toBe(400);
  });
});