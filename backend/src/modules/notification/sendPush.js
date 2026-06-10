const webpush = require('../../config/webpush');  // теперь путь правильный

async function sendPush(subscription, payload) {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload)
    );
  } catch (error) {
    console.error('Push error:', error.statusCode, error.body);
  }
}

module.exports = sendPush;