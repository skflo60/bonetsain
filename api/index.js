const express = require('express');
const router = express.Router();
const userRoute = require('./user');
const productRoute = require('./product');
const shopRoute = require('./shop');
const checkoutRoute = require('./checkout');
const timeRoute = require('./time');
const categoryRoute = require('./category');
const orderRoute = require('./order');

const seederRoute = require('./seeder');

router.use('/api/checkouts', checkoutRoute);
router.use('/api/users', userRoute);
router.use('/api/products', productRoute);
router.use('/api/shops', shopRoute);
router.use('/api/times', timeRoute);
router.use('/api/orders', orderRoute);
router.use('/api/categories', categoryRoute);
router.use('/api/seeders', seederRoute);

module.exports = router;
