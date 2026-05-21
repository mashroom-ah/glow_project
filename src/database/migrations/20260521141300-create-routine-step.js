'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('routine_step', {
      routine_step_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      routine_id: {
        type: Sequelize.UUID,
        allowNull: false,

        references: {
          model: 'routine',
          key: 'routine_id',
        },

        onDelete: 'CASCADE',
      },

      product_id: {
        type: Sequelize.UUID,
        allowNull: false,

        references: {
          model: 'product',
          key: 'product_id',
        },

        onDelete: 'CASCADE',
      },

      step_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      frequency_type: {
        type: Sequelize.ENUM(
          'daily',
          'weekly',
          'every_n_days'
        ),

        allowNull: false,
        defaultValue: 'daily',
      },

      frequency_value: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('routine_step');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_routine_step_frequency_type";'
    );
  },
};