const express = require('express');
const router = express.Router();
const userRoute = require('./user');
const productRoute = require('./product');
const shopRoute = require('./shop');
const categoryRoute = require('./category');

const seederRoute = require('./seeder');

router.use('/api/users', userRoute);
router.use('/api/products', productRoute);
router.use('/api/shops', shopRoute);
router.use('/api/categories', categoryRoute);
router.use('/api/seeders', seederRoute);

module.exports = router;
