const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const couponController = require('./coupon.controller');
const bodyParser = require('body-parser');

router.route('/').get(orderController.findAll);
router.route('/:id').patch(orderController.update);
router.route('/:id').get(orderController.findById);
router.route('/delivery/approval').post(orderController.isDeliveryPossible);
router.route('/validate', bodyParser.raw({type: "*/*"})).post(orderController.validate);
router.route('/coupons/validity').get(couponController.getAll);

module.exports = router;
