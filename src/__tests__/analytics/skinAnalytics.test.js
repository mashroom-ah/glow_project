const request =
    require('supertest');

const app =
    require('../setup/testServer');

const {
    getAuthToken,
} = require('../helpers/auth.helper');

describe(
    'Skin Analytics',
    () => {
        test(
            'should return skin analytics',
            async () => {
                const token =
                    await getAuthToken();

                const response =
                    await request(
                        app
                    )
                        .get(
                            '/api/analytics/skin?period=week&end_date=2026-05-22'
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