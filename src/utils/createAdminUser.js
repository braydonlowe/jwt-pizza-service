/* istanbul ignore file */

const { DB } = require('../database/database');
const { Role } = require('../database/database');
const randomName = require('./randomName');

async function createAdminUser(options = {}) {
    const user = {
        password: options.password || 'password1',
        roles: options.roles || [{ role: Role.Admin }],
        name: options.name || randomName(),
    };

    user.email = `${user.name}@admin.com`;

    await DB.addUser(user);

    return { ...user, password: 'password1'}
}

module.exports = { createAdminUser };