module.exports = (sequelize, DataTypes) => {
  const DailyEnvironment = sequelize.define(
    'DailyEnvironment',
    {
      daily_environment_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      temperature_avg: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },

      humidity_avg: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },

      uv_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      recommended_spf: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },

    {
      tableName: 'daily_environment',

      timestamps: false,
    }
  );

  return DailyEnvironment;
};