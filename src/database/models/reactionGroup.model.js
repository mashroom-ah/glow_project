module.exports = (sequelize, DataTypes) => {
  const ReactionGroup = sequelize.define(
    'ReactionGroup',
    {
      reaction_group_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      reaction_group_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },

    {
      tableName: 'reaction_group',

      timestamps: false,
    }
  );

  return ReactionGroup;
};