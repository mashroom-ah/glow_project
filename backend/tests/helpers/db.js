const { Sequelize } = require('sequelize');

let sequelize = null;

function getTestDatabase() {
  if (!sequelize) {
    sequelize = new Sequelize('sqlite::memory:', {
      logging: false,
      dialect: 'sqlite',
    });
  }
  return sequelize;
}

async function clearDatabase() {
  if (sequelize) {
    const tables = await sequelize.getQueryInterface().showAllTables();
    for (const table of tables) {
      await sequelize.getQueryInterface().dropTable(table);
    }
  }
}

module.exports = {
  getTestDatabase,
  clearDatabase,
};