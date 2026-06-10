const webpush = require('web-push');

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (!publicKey || !privateKey) {
  console.error('❌ VAPID keys missing in .env');
  process.exit(1);
}

webpush.setVapidDetails(
  'mailto:support@glow.com',
  publicKey,
  privateKey
);

module.exports = webpush;