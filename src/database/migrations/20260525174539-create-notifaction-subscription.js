'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'notification_subscription',
      {
        subscription_id: {
          type: Sequelize.UUID,
          defaultValue:
            Sequelize.UUIDV4,

          primaryKey: true,
          allowNull: false,
        },

        user_id: {
          type: Sequelize.UUID,
          allowNull: false,

          references: {
            model: 'user',
            key: 'user_id',
          },

          onDelete: 'CASCADE',
        },

        endpoint: {
          type: Sequelize.TEXT,
          allowNull: false,
        },

        p256dh: {
          type: Sequelize.TEXT,
          allowNull: false,
        },

        auth: {
          type: Sequelize.TEXT,
          allowNull: false,
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
      'notification_subscription'
    );
  },
};