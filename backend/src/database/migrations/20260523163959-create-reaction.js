'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reaction', {
      reaction_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
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

      reaction_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      'reaction'
    );
  },
};