'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('skin_reaction', {
      skin_reaction_id: {
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

      reaction_id: {
        type: Sequelize.UUID,
        allowNull: false,

        references: {
          model: 'reaction',
          key: 'reaction_id',
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
      'skin_reaction'
    );
  },
};