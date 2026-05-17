'use strict';

const { STRING } = require("sequelize");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('app_user', {
      user_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      password_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      city: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      height: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      weight: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      birth_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      activity_level: {
        type: Sequelize.ENUM(
          'low',
          'medium',
          'high'
        ),
        allowNull: false,
      },

      water_avg: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('app_user');
  },
};