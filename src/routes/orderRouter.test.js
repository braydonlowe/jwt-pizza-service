const app = require('../service');
const request = require('supertest');
const { createAdminUser } = require('../utils/createAdminUser');
const { createTestUser } = require('../utils/createUser');

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
    const orderData = {
        franchiseId: 1,
        storeId: 1,
        items: [{}]
    }
})