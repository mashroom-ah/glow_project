module.exports = (sequelize, DataTypes) => {
  const Reaction = sequelize.define(
    'Reaction',
    {
      reaction_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      reaction_group_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      reaction_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },

    {
      tableName: 'reaction',

      timestamps: false,
    }
  );

  return Reaction;
};