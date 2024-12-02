const app = require('../service');
const request = require('supertest');
const { createAdminUser } = require('../utils/createAdminUser');
const { createTestUser } = require('../utils/createUser');
const randomName = require('../utils/randomName');


let admin;
let adminAuth;

let user;
let userAuth;

async function createFranchise(authToken, franchiseObject) {
  const franchiseResponse = await request(app)
    .post('/api/franchise')
    .set('Authorization', `Bearer ${authToken}`)
    .send(franchiseObject);

  return franchiseResponse;
}


async function createStore(authToken, franchiseID, storeObject) {
  const storeResponse = await request(app)
      .post(`/api/franchise/${franchiseID}/store`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(storeObject);
    
  return storeResponse;
}


async function createFranchiseAndStore(adminToken) {
    const franchise = {
      name: randomName(),
      admins: [{ email: user.email }],
    };
  
    const franchiseResponse = await createFranchise(adminToken, franchise);
    const franchiseId = franchiseResponse.body.id;
  
    const store = { name: randomName() };
    const storeResponse = await createStore(adminToken, franchiseId, store)
  
    return [franchiseResponse, storeResponse];
  }


beforeAll(async () => {
    admin = await createAdminUser();
    const adminResponse = await request(app).put('/api/auth').send(admin);
    adminAuth = adminResponse.body.token;

    user = await createTestUser();
    userAuth = user.token;
});


test('Create Franch', async () =>  {
    const franchise = {
        name: randomName(),
        admins: [{ email: admin.email }],
      };
      const res = await createFranchise(adminAuth, franchise);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe(franchise.name);
});

test('Negative Create Franch', async () => {
  const franch = {
    name: randomName(),
    admins: [{ emial: admin.email }]
  }
  const response = await createFranchise(userAuth, franch);
  expect(response.status).toBe(403);
});

test('Get Franch', async () => {
  const response = await request(app).get('/api/franchise');
  expect(response.status).toBe(200);
});


test('Create and Delete Store', async () => {
    const [franchiseResponse, storeResponse] = await createFranchiseAndStore(adminAuth);
    const franchiseId = franchiseResponse.body.id;
    const storeId = storeResponse.body.id;


    const deleteResponse = await request(app)
        .delete(`/api/franchise/${franchiseId}/store/${storeId}`)
        .set('Authorization', `Bearer ${adminAuth}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBe('store deleted');
});

test('Create Franch as User', async () => {
  const franch = {
    name: randomName(),
    admins: [{ email: user.email }],
  };
  const response = await createFranchise(userAuth, franch);
  expect(response.status).toBe(403);
});

test('Delete Franch', async () => {
  const franch = {
    name: randomName(),
    admins: [{ email: admin.email }]
  }
  //Create the franch
  const createResponse = await createFranchise(adminAuth, franch)
  expect(createResponse.status).toBe(200);
  const franchID = createResponse.body.id
  //Delete the franch
  const response = await request(app)
    .delete(`/api/franchise/${franchID}`)
    .set('Authorization', `Bearer ${adminAuth}`);
  
  expect(response.status).toBe(200);
});

test('Create store as Admin', async () => {
  const franch = {
    name: randomName(),
    admins: [{ email: user.email }]
  }

  const store = {
    name: randomName()
  }

  const createResponse = await createFranchise(adminAuth, franch);
  expect(createResponse.status).toBe(200);
  const franchID = createResponse.body.id;

  const response = await createStore(adminAuth, franchID, store);
  expect(response.status).toBe(200);

});

test('Delete store as User', async() => {
  const [franchiseResponse, storeResponse] = await createFranchiseAndStore(adminAuth);
  const franchiseId = franchiseResponse.body.id;
  const storeId = storeResponse.body.id;

  const res = await request(app)
    .delete(`/api/franchise/${franchiseId}/store/${storeId}`)
    .set('Authorization', `Bearer ${userAuth}`);
  expect(res.status).toBe(200);
});