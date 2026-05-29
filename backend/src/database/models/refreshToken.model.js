module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define(
    'RefreshToken',
    {
      refresh_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      revoked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'refresh_token',

      underscored: true,

      createdAt: 'created_at',
      updatedAt: false,
    }
  );

  RefreshToken.associate = (models) => {
    RefreshToken.belongsTo(models.AppUser, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return RefreshToken;
};