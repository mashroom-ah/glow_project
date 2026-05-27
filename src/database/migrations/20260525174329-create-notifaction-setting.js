'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'notification_setting',
      {
        notification_setting_id: {
          type: Sequelize.UUID,
          defaultValue:
            Sequelize.UUIDV4,

          primaryKey: true,
          allowNull: false,
        },

        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          unique: true,

          references: {
            model: 'user',
            key: 'user_id',
          },

          onDelete: 'CASCADE',
        },

        push_enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },

        morning_enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },

        morning_time: {
          type: Sequelize.TIME,
          allowNull: true,
          defaultValue: '08:00:00',
        },

        evening_enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },

        evening_time: {
          type: Sequelize.TIME,
          allowNull: true,
          defaultValue: '21:00:00',
        },

        timezone: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'UTC',
        },

        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue:
            Sequelize.fn('NOW'),
        },

        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue:
            Sequelize.fn('NOW'),
        },
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      'notification_setting'
    );
  },
};