require('../setup/setupTestDB');
require('../setup/teardownTestDB');
require('../setup/mockWeather');

const request = require('supertest');

const app =
  require('../setup/testServer');

describe(
  'POST /api/auth/register',
  () => {
    test(
      'should register user',
      async () => {
        const response =
          await request(app)
            .post(
              '/api/auth/register'
            )
            .send({
              email:
                'user@test.com',
              password:
                '12345678',
              username:
                'test',
              city:
                'London',
            });

        expect(
          response.status
        ).toBe(201);

        expect(
          response.body
            .accessToken
        ).toBeDefined();

        expect(
          response.body.user
            .email
        ).toBe(
          'user@test.com'
        );
      }
    );

    test(
      'should reject duplicate email',
      async () => {
        await request(app)
          .post(
            '/api/auth/register'
          )
          .send({
            email:
              'duplicate@test.com',
            password:
              '12345678',
            username:
              'test',
            city:
              'London',
          });

        const response =
          await request(app)
            .post(
              '/api/auth/register'
            )
            .send({
              email:
                'duplicate@test.com',
              password:
                '12345678',
              username:
                'test2',
              city:
                'London',
            });

        expect(
          response.status
        ).toBe(400);
      }
    );
  }
);