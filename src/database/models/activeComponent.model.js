module.exports = (sequelize, DataTypes) => {
  const ActiveComponent = sequelize.define(
    'ActiveComponent',
    {
      component_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      component_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },

    {
      tableName: 'active_component',
      timestamps: false,
    }
  );

  return ActiveComponent;
};