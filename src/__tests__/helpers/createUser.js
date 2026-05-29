const request = require('supertest');

const app =
  require('../setup/testServer');

async function createUser() {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'test@test.com',
      password: '12345678',
      username: 'testuser',
      city: 'London',
    });

  return response.body;
}

module.exports = createUser;