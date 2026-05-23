module.exports = (sequelize, DataTypes) => {
  const RoutineStepLog = sequelize.define(
    'RoutineStepLog',
    {
      routine_step_log_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      routine_log_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      routine_step_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },

    {
      tableName: 'routine_step_log',

      timestamps: true,

      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return RoutineStepLog;
};