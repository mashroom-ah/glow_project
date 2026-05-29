const sequelize =
    require('../../src/database/config/database');

afterAll(async () => {
    await sequelize.close();
});