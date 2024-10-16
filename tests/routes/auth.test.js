/* eslint-disable */
import { expect } from 'chai';
import request from 'supertest';
import app from '../../server';

describe('GET /auth/logout', () => {
  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/disconnect');
    expect(res.status).to.equal(401);
    expect(res.body.error).to.equal('Unauthorized');
  });

  it('should return 204 if logout is successful with valid token', async () => {
    // First, login to get a token
    const loginRes = await request(app)
      .get('/connect')
      .set(
        'Authorization',
        'Basic ' + Buffer.from('user@example.com:password').toString('base64')
      );
  });
});
