/* istanbul ignore file */

const request = require('supertest');
const app = require('../service');

async function createFranchise(authToken, franchiseObject) {
    const franchiseResponse = await request(app)
      .post('/api/franchise')
      .set('Authorization', `Bearer ${authToken}`)
      .send(franchiseObject);
  
    return franchiseResponse;
  }


module.exports =  { createFranchise }