module.exports = (
  sequelize,
  DataTypes
) => {
  const NotificationSubscription =
    sequelize.define(
      'NotificationSubscription',
      {
        subscription_id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue:
            DataTypes.UUIDV4,
        },

        user_id: DataTypes.UUID,

        endpoint:
          DataTypes.TEXT,

        p256dh:
          DataTypes.TEXT,

        auth: DataTypes.TEXT,
      },

      {
        tableName:
          'notification_subscription',

        underscored: true,
      }
    );

  NotificationSubscription.associate =
    (models) => {
      NotificationSubscription.belongsTo(
        models.AppUser,
        {
          foreignKey: 'user_id',
        }
      );
    };

  return NotificationSubscription;
};