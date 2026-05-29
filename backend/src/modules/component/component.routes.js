const Router = require('express');

const componentController = require('./component.controller');

const authMiddleware =
    require('../../middlewares/auth.middleware');

const router = new Router();

router.use(authMiddleware);

router.get(
    '/',
    componentController.getAll
);

module.exports = router;