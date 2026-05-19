const Router = require('express');

const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/user/user.routes');
const itemRoutes = require('../modules/item/item.routes');

const router = new Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/item', itemRoutes);

module.exports = router;