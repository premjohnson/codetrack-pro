const request = require('supertest');
const app = require('../src/app');

describe('API Health Check Endpoint tests', () => {
  it('should return 200 OK with system status metrics', async () => {
    const response = await request(app)
      .get('/api/v1/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'System is healthy');
    expect(response.body.data).toHaveProperty('services');
    expect(response.body.data.services).toHaveProperty('server', 'up');
  });
});
