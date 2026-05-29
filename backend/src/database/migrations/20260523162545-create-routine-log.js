'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('routine_log', {
      routine_log_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      routine_id: {
        type: Sequelize.UUID,
        allowNull: true,

        references: {
          model: 'routine',
          key: 'routine_id',
        },

        onDelete: 'SET NULL',
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

      completed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('routine_log');
  },
};