const express = require('express');
const router = express.Router();
const recipeController = require('./recipe.controller');

router.route('/').get(recipeController.findAll);
router.route('/:id').get(recipeController.findById);
router.route('/:id/related').get(recipeController.findRelated);
router.route('/').put(recipeController.create);
router.route('/').post(recipeController.update);

module.exports = router;
