'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('group_component', {
      group_component_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      group_id: {
        type: Sequelize.UUID,
        allowNull: false,

        references: {
          model: 'product_group',
          key: 'group_id',
        },

        onDelete: 'CASCADE',
      },

      component_id: {
        type: Sequelize.UUID,
        allowNull: false,

        references: {
          model: 'active_component',
          key: 'component_id',
        },

        onDelete: 'CASCADE',
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('group_component');
  },
};