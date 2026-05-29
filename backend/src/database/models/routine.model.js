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

      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      archived_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },

    {
      tableName: 'routine',

      timestamps: true,

      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Routine;
};