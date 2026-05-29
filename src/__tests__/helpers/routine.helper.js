const request =
    require('supertest');

const app =
    require('../setup/testServer');

async function createRoutine(
    token
) {
    return request(app)
        .post('/api/routines')
        .set(
            'Authorization',
            `Bearer ${token}`
        )
        .send({
            routine_type:
                'morning',

            steps: [],
        });
}

module.exports = {
    createRoutine,
};