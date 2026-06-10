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
          title: 'Утренняя рутиня',
          body: 'Время утренней рутины',
        });
      }
    }

    if (
      setting.evening_enabled &&
      setting.evening_time.slice(0, 5) === currentTime
    ) {
      for (const subscription of setting.NotificationSubscriptions) {
        await sendPush(subscription, {
          title: 'Вечерняя рутина',
          body: 'Время вечернеё рутины',
        });
      }
    }
  }
});