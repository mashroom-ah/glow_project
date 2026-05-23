module.exports = (sequelize, DataTypes) => {
  const OverallScore = sequelize.define(
    'OverallScore',
    {
      overall_score_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      routine_log_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },

    {
      tableName: 'overall_score',

      timestamps: false,
    }
  );

  return OverallScore;
};