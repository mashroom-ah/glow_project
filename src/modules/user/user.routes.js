const Router = require('express');

const userController = require('./user.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = new Router();

router.get(
    '/me',
    authMiddleware,
    userController.getMe
);

module.exports = router;