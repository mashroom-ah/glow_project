const Router = require('express');

const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/user/user.routes');

const router = new Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router;