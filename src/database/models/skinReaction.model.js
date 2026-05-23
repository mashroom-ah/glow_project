module.exports = (sequelize, DataTypes) => {
  const SkinReaction = sequelize.define(
    'SkinReaction',
    {
      skin_reaction_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      routine_log_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      reaction_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },

    {
      tableName: 'skin_reaction',

      timestamps: false,
    }
  );

  return SkinReaction;
};