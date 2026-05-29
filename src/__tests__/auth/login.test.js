require('../setup/setupTestDB');
require('../setup/teardownTestDB');

const request = require('supertest');

const app =
  require('../setup/testServer');

describe(
  'POST /api/auth/login',
  () => {
    beforeEach(async () => {
      await request(app)
        .post(
          '/api/auth/register'
        )
        .send({
          email:
            'login@test.com',
          password:
            '12345678',
          username:
            'loginuser',
          city:
            'London',
        });
    });

    test(
      'should login user',
      async () => {
        const response =
          await request(app)
            .post(
              '/api/auth/login'
            )
            .send({
              email:
                'login@test.com',
              password:
                '12345678',
            });

        expect(
          response.status
        ).toBe(200);

        expect(
          response.body
            .accessToken
        ).toBeDefined();
      }
    );
  }
);