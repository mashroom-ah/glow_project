const Router = require('express');

const itemController = require('./item.controller');

const authMiddleware = require('../../middlewares/auth.middleware');

const router = new Router();

router.use(authMiddleware);

router.post(
  '/',
  itemController.create
);

router.get(
  '/',
  itemController.getAll
);

router.get(
  '/:id',
  itemController.getById
);

router.put(
  '/:id',
  itemController.update
);

router.delete(
  '/:id',
  itemController.delete
);

router.patch(
    '/:id/archive',
    itemController.archive
);

router.patch(
    '/:id/restore',
    itemController.restore
);

module.exports = router;