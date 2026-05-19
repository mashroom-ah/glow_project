module.exports = (sequelize, DataTypes) => {
  const Item = sequelize.define(
    'Item',
    {
      item_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      production_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      shelf_life_closed: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      shelf_life_open: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      opened_at: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      expiration_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: 'item',

      underscored: true,

      timestamps: false,
    }
  );

  return Item;
};