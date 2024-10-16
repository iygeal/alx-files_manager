/* eslint-disable */
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../server').default;

describe('GET /stats', () => {
  it('should return the stats of the database', async () => {
    const res = await request(app).get('/stats');
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.all.keys('users', 'files');
  });

  it('should return users and files count as numbers', async () => {
    const res = await request(app).get('/stats');
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.property('users').that.is.a('number');
    expect(res.body).to.have.property('files').that.is.a('number');
  });

  it('should return 404 for an invalid stats route', async () => {
    const res = await request(app).get('/invalid-stats');
    expect(res.statusCode).to.equal(404);
  });
});
