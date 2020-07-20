const express = require('express');
const router = express.Router();
const shopController = require('./shop.controller');

router.route('/').get(shopController.findAll);
router.route('/:id/producers').get(shopController.findProducers);
router.route('/:id').get(shopController.findById);
router.route('/:id').delete(shopController.removeProducer);
router.route('/:id/related').get(shopController.findRelated);
router.route('/').post(shopController.update);
router.route('/producer').post(shopController.updateProducer);
router.route('/producer').put(shopController.createProducer);

module.exports = router;
