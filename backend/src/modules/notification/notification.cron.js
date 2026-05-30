const cron = require('node-cron');

const {
  NotificationSetting,
  NotificationSubscription,
} = require('../../database/models');

const sendPush = require('./sendPush');

cron.schedule('* * * * *', async () => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);

  const settings = await NotificationSetting.findAll({
    where: { push_enabled: true },
    include: [
      {
        model: NotificationSubscription,
        as: 'NotificationSubscriptions',
      },
    ],
  });

  for (const setting of settings) {
    if (
      setting.morning_enabled &&
      setting.morning_time.slice(0, 5) === currentTime
    ) {
      for (const subscription of setting.NotificationSubscriptions) {
        await sendPush(subscription, {
          title: 'Morning routine',
          body: 'Time for your skincare routine',
        });
      }
    }

    if (
      setting.evening_enabled &&
      setting.evening_time.slice(0, 5) === currentTime
    ) {
      for (const subscription of setting.NotificationSubscriptions) {
        await sendPush(subscription, {
          title: 'Evening routine',
          body: 'Time for your evening skincare',
        });
      }
    }
  }
});