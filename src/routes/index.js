const Router = require('express');

const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/user/user.routes');
const itemRoutes = require('../modules/item/item.routes');
const productRoutes = require('../modules/product/product.routes');
const componentRoutes = require('../modules/component/component.routes');
const productGroupRoutes = require('../modules/product-group/productGroup.routes');
const routineRoutes = require('../modules/routine/routine.routes');

const router = new Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/item', itemRoutes);
router.use('/products', productRoutes);
router.use('/product-groups', productGroupRoutes);
router.use('/components', componentRoutes);
router.use('/routines', routineRoutes);

module.exports = router;