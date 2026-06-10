const Router = require('express');
const router = new Router();
const groupComponentController = require('./groupComponent.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/by-group', groupComponentController.getByGroup);

module.exports = router;