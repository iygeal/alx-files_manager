/* eslint-disable */
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../server').default;

describe('GET /status', () => {
  it('should return the status of the API', async () => {
    const res = await request(app).get('/status');
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.property('redis', true);
    expect(res.body).to.have.property('db', true);
  });

  it('should always return a response with redis and db properties', async () => {
    const res = await request(app).get('/status');
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.all.keys('redis', 'db');
  });

  it('should return 404 for an invalid status route', async () => {
    const res = await request(app).get('/invalid-status');
    expect(res.statusCode).to.equal(404);
  });
});
