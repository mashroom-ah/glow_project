const Router = require('express');

const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/user/user.routes');
const itemRoutes = require('../modules/item/item.routes');
const productRoutes = require('../modules/product/product.routes');
const componentRoutes = require('../modules/component/component.routes');
const productGroupRoutes = require('../modules/product-group/productGroup.routes');
const routineRoutes = require('../modules/routine/routine.routes');
const routineLogRoutes = require('../modules/routine-log/routineLog.routes');
const analyticsRoutes = require('../modules/analytics/analytics.routes');
const skinReactionRoutes = require('./modules/skin-reaction/skinReaction.routes');

const router = new Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/item', itemRoutes);
router.use('/products', productRoutes);
router.use('/product-groups', productGroupRoutes);
router.use('/components', componentRoutes);
router.use('/routines', routineRoutes);
router.use('/routine-log', routineLogRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/skin-reactions', skinReactionRoutes);

module.exports = router;