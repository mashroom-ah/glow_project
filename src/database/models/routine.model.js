module.exports = (sequelize, DataTypes) => {
  const Routine = sequelize.define(
    'Routine',
    {
      routine_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      routine_type: {
        type: DataTypes.ENUM(
          'morning',
          'evening',
          'universal'
        ),

        allowNull: false,
      },
    },

    {
      tableName: 'routine',

      timestamps: false,
    }
  );

  return Routine;
};