const Router = require('express');

const authController = require('./auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = new Router();
const validationMiddleware = require('../../middlewares/validation.middleware');

const {
    registerSchema,
    loginSchema,
} = require('./auth.validation');

router.post(
    '/register',
    validationMiddleware(registerSchema),
    authController.register
);

router.post(
    '/login',
    validationMiddleware(loginSchema),
    authController.login
);

router.post(
    '/refresh',
    authController.refresh
);

router.post(
    '/logout',
    authController.logout
);

router.get(
    '/me',
    authMiddleware,
    authController.me
);

module.exports = router;