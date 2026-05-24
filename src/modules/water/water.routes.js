const Router = require('express');

const router = new Router();

const authMiddleware = require(
  '../../middlewares/auth.middleware'
);

const controller = require(
  './water.controller'
);

router.use(authMiddleware);

router.get(
  '/today',
  controller.getToday
);

router.post(
  '/add',
  controller.addWater
);

router.post(
  '/subtract',
  controller.removeWater
);

module.exports = router;