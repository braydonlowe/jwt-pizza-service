const request = require('supertest');
const app = require('../service');
const { createAdminUser } = require('../utils/createAdminUser')

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
let testUserAuthToken;
let testId;

beforeAll(async () => {
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = registerRes.body.token;
  testId = registerRes.body.user.id;
  expectValidJwt(testUserAuthToken);
});

test('login', async () => {
  const loginRes = await request(app).put('/api/auth').send(testUser);
  expect(loginRes.status).toBe(200);
  expectValidJwt(loginRes.body.token);

  const expectedUser = { ...testUser, roles: [{ role: 'diner' }] };
  delete expectedUser.password;
  expect(loginRes.body.user).toMatchObject(expectedUser);
});

function expectValidJwt(potentialJwt) {
  expect(potentialJwt).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
}

async function sendUpdateRequest(app, userID, token, updateObject) {
  try {
    const response = await request(app)
    .put(`/api/auth/${userID}`)
    .set('Authorization', `Bearer ${token}`)
    .send(updateObject);
    return response;

  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

test('Update Admin User', async () => {
  const admin = await createAdminUser();
  //My function doesn't ever post to the thing.
  const adminResponse = await request(app)
    .put('/api/auth')
    .send(admin);
  const adminAuth = adminResponse.body.token;
  const adminId = adminResponse.body.user.id;
  const updateObject = {
    email: 'theBestEmailEver@email.com',
    password: 'coolPassword'
  };
  const response = await sendUpdateRequest(app, adminId, adminAuth, updateObject);
  expect(response.status).toBe(200);
});

test('Negative: Update Admin User', async () => {
  const admin = await createAdminUser();
  //My function doesn't ever post to the thing.
  const adminResponse = await request(app)
    .put('/api/auth')
    .send(admin);
  const adminAuth = adminResponse.body.token;
  const adminId = adminResponse.body.user.id;
  const updateObject = {
    email: 'theBestEmailEver@email.com',
    password: 'coolPassword'
  };
  const response = await sendUpdateRequest(app, adminId, '12345', updateObject);
  expect(response.status).toBe(401);
});


test('Update Test User', async () => {
  const updateObject = {
    email: 'theBestEmailEver@email.com',
    password: 'coolPassword'
  };
  const response = await sendUpdateRequest(app, testId, testUserAuthToken, updateObject);
  expect(response.status).toBe(200);
});

test('Negative: Update Test User', async () => {
  const updateObject = {
    email: 'theBestEmailEver@email.com',
    password: 'coolPassword'
  };
  const response = await sendUpdateRequest(app, testId, '123345', updateObject);
  expect(response.status).toBe(401);
});


test('Forbidden: Update Test User', async () => {
  const updateObject = {
    email: 'theBestEmailEver@email.com',
    password: 'coolPassword'
  };
  const response = await sendUpdateRequest(app, 'anotherId', testUserAuthToken, updateObject);
  expect(response.status).toBe(403);
});


test('Logout', async () => {
  const response = await request(app)
    .delete('/api/auth')
    .set('Authorization', `Bearer ${testUserAuthToken}`)
    .send();

  expect(response.status).toBe(200);
});


test('Invalid logout', async () => {
  const response = await request(app)
    .delete('/api/auth')
    .set('Authorization', `Bearer 12345`)
    .send();
  expect(response.status).toBe(401);
})