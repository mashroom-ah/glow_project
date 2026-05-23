module.exports = (sequelize, DataTypes) => {
  const RoutineLog = sequelize.define(
    'RoutineLog',
    {
      routine_log_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      routine_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      completed_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },

    {
      tableName: 'routine_log',

      timestamps: false,
    }
  );

  return RoutineLog;
};