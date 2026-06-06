const Router = require('express');

const router = new Router();

const authMiddleware = require(
    '../../middlewares/auth.middleware'
)

const controller = require(
    './spf.controller'
);

router.use(authMiddleware);

router.get('/', controller.GetSPF);

module.exports = router;