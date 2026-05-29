const sequelize =
    require('../../src/database/config/database');

beforeAll(async () => {
    await sequelize.sync({
        force: true,
    });
});

afterEach(async () => {
    const models =
        sequelize.models;

    for (const key of Object.keys(models)) {
        await models[key].destroy({
            where: {},
            force: true,
            truncate: {
                cascade: true,
            },
        });
    }
});