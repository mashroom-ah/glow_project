'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('routine', {
      routine_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      user_id: {
        type: Sequelize.UUID,
        allowNull: false,

        references: {
          model: 'app_user',
          key: 'user_id',
        },

        onDelete: 'CASCADE',
      },

      routine_type: {
        type: Sequelize.ENUM(
          'morning',
          'evening',
          'universal'
        ),

        allowNull: false,
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('routine');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_routine_routine_type";'
    );
  },
};