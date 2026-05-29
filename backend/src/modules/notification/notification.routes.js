const Router = require('express');

const router = new Router();

const authMiddleware =
  require(
    '../../middlewares/auth.middleware'
  );

const controller = require(
  './notification.controller'
);

router.use(authMiddleware);

router.get(
  '/settings',
  controller.getSettings
);

router.patch(
  '/settings',
  controller.updateSettings
);

router.post(
  '/subscriptions',
  controller.subscribe
);

router.delete(
  '/subscriptions',
  controller.unsubscribe
);

module.exports = router;