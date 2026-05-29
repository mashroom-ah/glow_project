const request =
    require('supertest');

const app =
    require('../setup/testServer');

const {
    getAuthToken,
} = require('../helpers/auth.helper');

describe(
    'Get Routines',
    () => {
        test(
            'should return routines',
            async () => {
                const token =
                    await getAuthToken();

                await request(app)
                    .post(
                        '/api/routines'
                    )
                    .set(
                        'Authorization',
                        `Bearer ${token}`
                    )
                    .send({
                        routine_type:
                            'morning',

                        steps: [],
                    });

                const response =
                    await request(
                        app
                    )
                        .get(
                            '/api/routines'
                        )
                        .set(
                            'Authorization',
                            `Bearer ${token}`
                        );

                expect(
                    response.status
                ).toBe(200);

                expect(
                    Array.isArray(
                        response.body
                    )
                ).toBe(true);
            }
        );
    }
);