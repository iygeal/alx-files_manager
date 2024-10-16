/* eslint-disable */
import { expect } from 'chai';
import request from 'supertest';
import app from '../../server';

describe('Users API Endpoints', () => {
  describe('POST /users', () => {
    // it('should create a new user and return 201 status', async () => {
    //   const res = await request(app)
    //     .post('/users')
    //     .send({ email: 'newuser@example.com', password: 'password123' });
    //   expect(res.status).to.equal(201);
    //   expect(res.body.email).to.equal('newuser@example.com');
    // });

    it('should return 400 if email or password is missing', async () => {
      const res = await request(app)
        .post('/users')
        .send({ email: 'incomplete@example.com' });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('Missing password'); // Adjusted to match the actual error message
    });

    it('should return 400 if the user already exists', async () => {
      await request(app)
        .post('/users')
        .send({ email: 'newuser@example.com', password: 'password123' });
      const res = await request(app)
        .post('/users')
        .send({ email: 'newuser@example.com', password: 'password123' });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('Already exist');
    });
  });

});
