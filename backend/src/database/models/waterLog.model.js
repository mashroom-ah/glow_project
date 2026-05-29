module.exports = (sequelize, DataTypes) => {
  const WaterLog = sequelize.define(
    'WaterLog',
    {
      water_log_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      daily_environment_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      target_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      achieved_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },

    {
      tableName: 'water_log',

      timestamps: false,
    }
  );

  return WaterLog;
};