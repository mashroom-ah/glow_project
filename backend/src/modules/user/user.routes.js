const Router = require('express');

const userController = require('./user.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = new Router();

router.get(
    '/me',
    authMiddleware,
    userController.getMe
);

router.put(
    '/profile',
    authMiddleware,
    userController.updateProfile
);

module.exports = router;