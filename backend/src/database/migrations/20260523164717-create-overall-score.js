'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('overall_score', {
      overall_score_id: {
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

      score: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      'overall_score'
    );
  },
};