const Router = require('express');

const streakController = require('./streak.controller');

const authMiddleware = require('../../middlewares/auth.middleware');

const router = new Router();

router.use(authMiddleware);

router.get(
  '/',
  streakController.getStreak
);

module.exports = router;