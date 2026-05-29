const request =
    require('supertest');

const app =
    require('../setup/testServer');

describe(
    'Auth Middleware',
    () => {
        test(
            'should reject without token',
            async () => {
                const response =
                    await request(
                        app
                    ).get(
                        '/api/routines'
                    );

                expect(
                    response.status
                ).toBe(401);
            }
        );
    }
);