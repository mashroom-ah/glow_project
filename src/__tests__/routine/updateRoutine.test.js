const request =
    require('supertest');

const app =
    require('../setup/testServer');

const {
    getAuthToken,
} = require('../helpers/auth.helper');

describe(
    'Update Routine',
    () => {
        test(
            'should update routine',
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

                const routineId =
                    created.body
                        .routine_id;

                const response =
                    await request(
                        app
                    )
                        .put(
                            `/api/routines/${routineId}`
                        )
                        .set(
                            'Authorization',
                            `Bearer ${token}`
                        )
                        .send({
                            routine_type:
                                'evening',

                            steps: [],
                        });

                expect(
                    response.status
                ).toBe(200);

                expect(
                    response.body
                        .routine_type
                ).toBe(
                    'evening'
                );
            }
        );
    }
);