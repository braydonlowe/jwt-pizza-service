/* istanbul ignore file */
const request = require('supertest');
const app = require('../service');
const { createFranchise } = require('../utils/createFranchise');
const { createStore } = require('../utils/createStore');
const randomName = require('../utils/randomName');


async function createFranchiseAndStore(adminToken, adminUser) {
    const franchise = {
      name: randomName(),
      admins: [{ email: adminUser.email }],
    };
  
    const franchiseResponse = await createFranchise(adminToken, franchise);
    const franchiseId = franchiseResponse.body.id;
  
    const store = { name: randomName() };
    const storeResponse = await createStore(adminToken, franchiseId, store)
  
    return [franchiseResponse, storeResponse];
  }

module.exports = { createFranchiseAndStore }