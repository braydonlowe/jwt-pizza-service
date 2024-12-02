/* istanbul ignore file */

const request = require('supertest');
const app = require('../service');

async function createStore(authToken, franchiseID, storeObject) {
    const storeResponse = await request(app)
        .post(`/api/franchise/${franchiseID}/store`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(storeObject);
      
    return storeResponse;
  }

module.exports =  { createStore }