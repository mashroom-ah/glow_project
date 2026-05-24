'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'daily_environment',
      {
        daily_environment_id: {
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

        date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },

        temperature_avg: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },

        humidity_avg: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },

        uv_index: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },

        recommended_spf: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      }
    );

    await queryInterface.addConstraint(
      'daily_environment',
      {
        fields: ['user_id', 'date'],
        type: 'unique',
        name:
          'daily_environment_user_id_date_unique',
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      'daily_environment'
    );
  },
};