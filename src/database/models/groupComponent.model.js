module.exports = (sequelize, DataTypes) => {
  const GroupComponent = sequelize.define(
    'GroupComponent',
    {
      group_component_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      group_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      component_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },

    {
      tableName: 'group_component',

      timestamps: false,
    }
  );

  return GroupComponent;
};