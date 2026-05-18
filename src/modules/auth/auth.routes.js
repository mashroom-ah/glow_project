const Router = require('express');

const authController = require('./auth.controller');

const router = new Router();

router.post(
    '/register',
    authController.register
);

router.post(
    '/login',
    authController.login
);

module.exports = router;