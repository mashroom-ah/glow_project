const Router = require('express');

const productController =
  require('./product.controller');

const authMiddleware =
  require('../../middlewares/auth.middleware');

const router = new Router();

router.use(authMiddleware);

router.get(
  '/',
  productController.getAll
);

router.get(
  '/:id',
  productController.getById
);

module.exports = router;