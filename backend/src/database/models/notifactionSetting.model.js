module.exports = (
  sequelize,
  DataTypes
) => {
  const NotificationSetting =
    sequelize.define(
      'NotificationSetting',
      {
        notification_setting_id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue:
            DataTypes.UUIDV4,
        },

        user_id: DataTypes.UUID,

        push_enabled:
          DataTypes.BOOLEAN,

        morning_enabled:
          DataTypes.BOOLEAN,

        morning_time:
          DataTypes.TIME,

        evening_enabled:
          DataTypes.BOOLEAN,

        evening_time:
          DataTypes.TIME,

        timezone:
          DataTypes.STRING,
      },

      {
        tableName:
          'notification_setting',

        underscored: true,
      }
    );

  NotificationSetting.associate =
    (models) => {
      NotificationSetting.belongsTo(
        models.AppUser,
        {
          foreignKey: 'user_id',
        }
      );
    };

  return NotificationSetting;
};