const request =
    require('supertest');

const app =
    require('../setup/testServer');

const {
    getAuthToken,
} = require('../helpers/auth.helper');

describe(
    'Routine Analytics',
    () => {
        test(
            'should return analytics',
            async () => {
                const token =
                    await getAuthToken();

                const response =
                    await request(
                        app
                    )
                        .get(
                            '/api/analytics/routine?type=morning&period=week&end_date=2026-05-22'
                        )
                        .set(
                            'Authorization',
                            `Bearer ${token}`
                        );

                expect(
                    response.status
                ).toBe(200);

                expect(
                    response.body.data
                ).toBeDefined();
            }
        );
    }
);