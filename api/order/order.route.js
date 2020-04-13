const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');

router.route('/').get(orderController.findAll);
router.route('/:id').get(orderController.findById);

module.exports = router;
