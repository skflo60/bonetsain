const express = require('express');
const router = express.Router();
const productController = require('./product.controller');

router.route('/').get(productController.findAll);
router.route('/top').get(productController.findAllTop);
router.route('/drive/').get(productController.findAllFromDrive);
router.route('/:id').get(productController.findById);
router.route('/:id/related').get(productController.findRelated);
router.route('/:id').delete(productController.remove);
router.route('/').post(productController.update);
router.route('/').put(productController.create);

module.exports = router;
