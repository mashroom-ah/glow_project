'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('active_component', {
      component_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      component_name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('active_component');
  },
};