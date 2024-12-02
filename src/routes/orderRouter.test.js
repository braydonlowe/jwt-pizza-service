const app = require('../service');
const request = require('supertest');
const { createAdminUser } = require('../utils/createAdminUser');
const { createTestUser } = require('../utils/createUser');
const { createFranchiseAndStore } = require('../utils/createFranchiseAndStore');
const randomName = require('../utils/randomName');
require('jest-fetch-mock').enableMocks();

let adminAuth;
let admin;
let item;

beforeAll(async () => {
    admin = await createAdminUser();
    const response = await request(app)
        .put('/api/auth')
        .send(admin);
    adminAuth = response.body.token;

    //An example item that I will use durring the tests.
    item = {
        title: 'ThisIsPizza',
        description: 'WonderfulPizza',
        image: 'doesThisHaveToBeAnActualImage.png',
        price: 1
    };

});


test('addItem', async () => {
    const response = await request(app)
    .put('/api/order/menu')
    .set('Authorization', `Bearer ${adminAuth}`)
    .send(item);

    expect(response.status).toBe(200);
    expect(response.body[0].title).toBe('ThisIsPizza');
});


test('addItem - Insuficcient Promissions', async () => {
    const testUser = await createTestUser();
    const userAuth = testUser.token;
    const response = await request(app)
    .put('/api/order/menu')
    .set('Authorization', `Bearer ${userAuth}`)
    .send(item);

    expect(response.status).toBe(403);
});


test('getMenu', async () => {
    const response = await request(app)
    .get('/api/order/menu');

    expect(response.status).toBe(200);
});



test('CreateOrder', async () => {
    fetch.mockResponseOnce(JSON.stringify({ message: 'Success' }), { status: 200 });

    const [franchiseResponse, storeResponse] = await createFranchiseAndStore(adminAuth, admin);
    const franchID = franchiseResponse.body.id;
    const storeID = storeResponse.body.id;
    
    const createRepsonse = await request(app)
        .put('/api/order/menu')
        .set('Authorization', `Bearer ${adminAuth}`)
        .send(item);

    const itemID = createRepsonse.body[createRepsonse.body.length - 1].id;
    const description1 = createRepsonse.body[createRepsonse.body.length - 1].description;
    const price1 = createRepsonse.body[createRepsonse.body.length - 1].price;
    const order = {
        franchiseId: franchID,
        storeId: storeID,
        items: [{ 
            menuId: itemID, 
            description: description1,
            price: price1
        }]
    };
    const user = await createTestUser();
    const userAuth = user.token;

    const response = await request(app)
        .post('/api/order')
        .set('Authorization', `Bearer ${userAuth}`)
        .send(order);

    expect(response.status).toBe(200);

});


test('CreateOrder 500 Error', async () => {
    fetch.mockResponseOnce(JSON.stringify({ message: 'Factory error' }), { status: 500 });

    const [franchiseResponse, storeResponse] = await createFranchiseAndStore(adminAuth, admin);
    const franchID = franchiseResponse.body.id;
    const storeID = storeResponse.body.id;
    
    const createRepsonse = await request(app)
        .put('/api/order/menu')
        .set('Authorization', `Bearer ${adminAuth}`)
        .send(item);

    const itemID = createRepsonse.body[createRepsonse.body.length - 1].id;
    const description1 = createRepsonse.body[createRepsonse.body.length - 1].description;
    const price1 = createRepsonse.body[createRepsonse.body.length - 1].price;
    //storeId changed to stireId
    const order = {
        franchiseId: franchID,
        storeId: storeID,
        items: [{ 
            menuId: itemID, 
            description: description1,
            price: price1
        }]
    };
    const user = await createTestUser();
    const userAuth = user.token;

    const response = await request(app)
        .post('/api/order')
        .set('Authorization', `Bearer ${userAuth}`)
        .send(order);

    expect(response.status).toBe(500);

})