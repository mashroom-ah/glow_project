const Router = require('express');

const router = new Router();

const authMiddleware =
  require('../../middlewares/auth.middleware');

const controller =
  require('./routineLog.controller');

router.use(authMiddleware);

router.post(
  '/',
  controller.create
);

router.get(
  '/date/:date',
  controller.getByDate
);

module.exports = router;