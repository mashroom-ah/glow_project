'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('item', {
      item_id: {
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

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      production_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      shelf_life_closed: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      shelf_life_open: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      opened_at: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      expiration_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM(
          'fresh',
          'expiring_soon',
          'expiring',
          'expired'
        ),
        allowNull: false,
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
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
    await queryInterface.dropTable('item');
  },
};