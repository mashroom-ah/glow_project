module.exports = (sequelize, DataTypes) => {
  const ReactionGroupScore = sequelize.define(
    'ReactionGroupScore',
    {
      reaction_group_score_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      routine_log_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      reaction_group_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      score: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },

    {
      tableName: 'reaction_group_score',

      timestamps: false,
    }
  );

  return ReactionGroupScore;
};