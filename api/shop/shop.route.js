const express = require('express');
const router = express.Router();
const shopController = require('./shop.controller');

router.route('/').get(shopController.findAll);
router.route('/:id').get(shopController.findById);
router.route('/:id/related').get(shopController.findRelated);
router.route('/').post(shopController.update);

module.exports = router;
