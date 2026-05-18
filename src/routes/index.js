const Router = require('express');

const authRoutes = require('../modules/auth/auth.routes');

const router = new Router();

router.use('/auth', authRoutes);

module.exports = router;