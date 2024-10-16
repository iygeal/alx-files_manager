/* eslint-disable */
import { expect } from 'chai';
import request from 'supertest';
import app from '../../server';

describe('Files API Endpoints', () => {
  describe('POST /files', () => {
    it('should return 401 if no token is provided when uploading a file', async () => {
      const res = await request(app).post('/files');
      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal('Unauthorized');
    });
  });

  describe('GET /files', () => {
    it('should return 401 if no token is provided when fetching files', async () => {
      const res = await request(app).get('/files');
      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal('Unauthorized');
    });
  });

  describe('GET /files/:id', () => {
    it('should return 401 if no token is provided for file details', async () => {
      const res = await request(app).get('/files/123');
      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal('Unauthorized');
    });
  });

  describe('PUT /files/:id/publish', () => {
    it('should return 401 if no token is provided for publishing a file', async () => {
      const res = await request(app).put('/files/123/publish');
      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal('Unauthorized');
    });
  });

  describe('PUT /files/:id/unpublish', () => {
    it('should return 401 if no token is provided for unpublishing a file', async () => {
      const res = await request(app).put('/files/123/unpublish');
      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal('Unauthorized');
    });
  });
});
