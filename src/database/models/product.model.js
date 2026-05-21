module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    'Product',
    {
      product_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      product_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      group_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      component_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },

    {
      tableName: 'product',

      timestamps: false,
    }
  );

  return Product;
};