/* istanbul ignore file */

const request = require('supertest');
const app = require('../service');
const randomName = require('./randomName');

async function createTestUser(options = {}) {
  const user = {
    name: options.name || randomName(),
    email: options.email || `${randomName()}@test.com`,
    password: options.password || 'a',
  };

  const registerRes = await request(app).post('/api/auth').send(user);
  const testUserAuthToken = registerRes.body.token;

  return { ...user, token: testUserAuthToken };
}

module.exports = { createTestUser };