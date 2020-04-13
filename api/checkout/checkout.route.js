const express = require('express');
const router = express.Router();
const checkoutController = require('./checkout.controller');

router.route('/session/:uid').get(checkoutController.verifySession);
router.route('/session').post(checkoutController.getSession);

module.exports = router;
