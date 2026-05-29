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

      product_name: {
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
    });

    await queryInterface.addIndex(
      'product',
      ['product_name', 'group_id', 'component_id'],
      {
        unique: true,
        name: 'product_unique_name_group_component',
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'product',
      'product_unique_name_group_component'
    );

    await queryInterface.dropTable('product');
  },
};