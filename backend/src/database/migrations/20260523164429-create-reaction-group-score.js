'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'reaction_group_score',
      {
        reaction_group_score_id: {
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

        reaction_group_id: {
          type: Sequelize.UUID,
          allowNull: false,

          references: {
            model: 'reaction_group',
            key: 'reaction_group_id',
          },

          onDelete: 'CASCADE',
        },

        score: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      'reaction_group_score'
    );
  },
};