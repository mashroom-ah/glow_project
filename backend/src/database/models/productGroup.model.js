module.exports = (sequelize, DataTypes) => {
  const ProductGroup = sequelize.define(
    'ProductGroup',
    {
      group_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      group_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },

    {
      tableName: 'product_group',
      timestamps: false,
    }
  );

  return ProductGroup;
};