'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product', {
      product_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING,
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
        allowNull: true,

        references: {
          model: 'active_component',
          key: 'component_id',
        },

        onDelete: 'SET NULL',
      },
    },
      {
        indexes: [
          {
            unique: true,
            fields: ['name','group_id', 'component_id'],
          },
        ],
      });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product');
  },
};