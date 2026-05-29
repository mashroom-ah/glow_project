'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('routine_step_log', {
      routine_step_log_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      routine_log_id: {
        type: Sequelize.UUID,
        allowNull: false,

        references: {
          model: 'routine_log',
          key: 'routine_log_id',
        },

        onDelete: 'CASCADE',
      },

      routine_step_id: {
        type: Sequelize.UUID,
        allowNull: false,

        references: {
          model: 'routine_step',
          key: 'routine_step_id',
        }
      },

      completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      'routine_step_log'
    );
  },
};