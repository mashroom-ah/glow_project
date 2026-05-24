const Router = require('express');

const router = new Router();

const authMiddleware =
  require('../../middlewares/auth.middleware');

const controller =
  require('./analytics.controller');

router.use(authMiddleware);

router.get(
  '/routine',
  controller.getRoutineAnalytics
);

router.get(
  '/skin',
  controller.getOverallScoreAnalytics
);

router.get(
  '/reaction-groups',
  controller.getReactionGroupAnalytics
);

module.exports = router;