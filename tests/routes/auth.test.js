/* eslint-disable */
import request from 'supertest';
import { expect } from 'chai';
import app from '../../server'; // Ensure you are importing your app correctly

describe('POST /auth/login', () => {
  it('should return 401 if login credentials are invalid', async () => {
    const res = await request(app)
      .post('/connect')
      .auth('invalid@example.com', 'wrongpassword');
    expect(res.statusCode).to.equal(401);
    expect(res.body).to.have.property('error', 'Unauthorized');
  });

  it('should return 200 and a token if login credentials are valid', async () => {
    const res = await request(app)
      .post('/connect')
      .auth('valid@example.com', 'correctpassword'); // Ensure these credentials match a user in your DB
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.property('token');
  });
});

describe('GET /auth/logout', () => {
  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/disconnect');
    expect(res.statusCode).to.equal(401);
    expect(res.body).to.have.property('error', 'Unauthorized');
  });

  it('should return 204 if logout is successful with valid token', async () => {
    const loginRes = await request(app)
      .post('/connect')
      .auth('valid@example.com', 'correctpassword');
    const token = loginRes.body.token; // Ensure this is being set correctly

    const res = await request(app).get('/disconnect').set('X-Token', token);
    expect(res.statusCode).to.equal(204);
  });
});
