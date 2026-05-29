const request =
    require('supertest');

const app =
    require('../setup/testServer');

const {
    getAuthToken,
} = require('../helpers/auth.helper');

describe(
    'Create Routine',
    () => {
        test(
            'should create routine',
            async () => {
                const token =
                    await getAuthToken();

                const response =
                    await request(
                        app
                    )
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

                expect(
                    response.status
                ).toBe(201);

                expect(
                    response.body
                        .routine_type
                ).toBe(
                    'morning'
                );
            }
        );
    }
);