const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');

router.route('/').get(orderController.findAll);
router.route('/:id').patch(orderController.update);
router.route('/:id').get(orderController.findById);
router.route('/delivery/approval').post(orderController.isDeliveryPossible);
router.route('/validate').post(orderController.validate);

module.exports = router;
