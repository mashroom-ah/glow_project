'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('water_log', {
      water_log_id: {
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

      daily_environment_id: {
        type: Sequelize.UUID,
        allowNull: false,

        references: {
          model: 'daily_environment',
          key: 'daily_environment_id',
        },

        onDelete: 'CASCADE',
      },

      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      target_amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      achieved_amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    });

    await queryInterface.addConstraint(
      'water_log',
      {
        fields: ['user_id', 'date'],
        type: 'unique',
        name:
          'water_log_user_id_date_unique',
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      'water_log'
    );
  },
};