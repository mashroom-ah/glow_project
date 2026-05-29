const Router = require('express');

const productGroupController =
  require('./productGroup.controller');

const authMiddleware =
  require('../../middlewares/auth.middleware');

const router = new Router();

router.use(authMiddleware);

router.get(
  '/',
  productGroupController.getAll
);

module.exports = router;