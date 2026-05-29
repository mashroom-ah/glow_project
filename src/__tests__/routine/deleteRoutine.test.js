const request =
    require('supertest');

const app =
    require('../setup/testServer');

const {
    getAuthToken,
} = require('../helpers/auth.helper');

describe(
    'Delete Routine',
    () => {
        test(
            'should archive routine',
            async () => {
                const token =
                    await getAuthToken();

                const created =
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
                        .delete(
                            `/api/routines/${created.body.routine_id}`
                        )
                        .set(
                            'Authorization',
                            `Bearer ${token}`
                        );

                expect(
                    response.status
                ).toBe(200);
            }
        );
    }
);