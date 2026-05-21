module.exports = (sequelize, DataTypes) => {
  const RoutineStep = sequelize.define(
    'RoutineStep',
    {
      routine_step_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      routine_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      step_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      frequency_type: {
        type: DataTypes.ENUM(
          'daily',
          'weekly',
          'every_n_days'
        ),

        allowNull: false,

        defaultValue: 'daily',
      },

      frequency_value: {
        type: DataTypes.INTEGER,
        allowNull: false,

        defaultValue: 0,
      },
    },

    {
      tableName: 'routine_step',

      timestamps: false,
    }
  );

  return RoutineStep;
};