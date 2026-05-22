const Router = require('express');

const routineController =
  require('./routine.controller');

const authMiddleware =
  require('../../middlewares/auth.middleware');

const router = new Router();

router.use(authMiddleware);

router.post(
  '/',
  routineController.create
);

router.get(
  '/',
  routineController.getAll
);

router.get(
  '/:id',
  routineController.getById
);

router.put(
  '/:id',
  routineController.update
);

router.delete(
  '/:id',
  routineController.delete
);

router.post(
  '/validate',
  routineController.validate
);

module.exports = router;