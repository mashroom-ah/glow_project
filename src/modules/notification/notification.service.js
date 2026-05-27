const {
  NotificationSetting,
  NotificationSubscription,
} = require(
  '../../database/models'
);

class NotificationService {
  async getSettings(userId) {
    let settings =
      await NotificationSetting.findOne(
        {
          where: {
            user_id: userId,
          },
        }
      );

    if (!settings) {
      settings =
        await NotificationSetting.create(
          {
            user_id: userId,
          }
        );
    }

    return settings;
  }

  async updateSettings(
    userId,
    data
  ) {
    let settings =
      await NotificationSetting.findOne(
        {
          where: {
            user_id: userId,
          },
        }
      );

    if (!settings) {
      settings =
        await NotificationSetting.create(
          {
            user_id: userId,
          }
        );
    }

    await settings.update(data);

    return settings;
  }

  async saveSubscription(
    userId,
    subscription
  ) {
    const existing =
      await NotificationSubscription.findOne(
        {
          where: {
            endpoint:
              subscription.endpoint,
          },
        }
      );

    if (existing) {
      return existing;
    }

    return NotificationSubscription.create(
      {
        user_id: userId,

        endpoint:
          subscription.endpoint,

        p256dh:
          subscription.keys
            .p256dh,

        auth:
          subscription.keys.auth,
      }
    );
  }

  async removeSubscription(
    endpoint
  ) {
    await NotificationSubscription.destroy(
      {
        where: {
          endpoint,
        },
      }
    );

    return {
      message:
        'Subscription removed',
    };
  }
}

module.exports =
  new NotificationService();