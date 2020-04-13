const express = require('express');
const router = express.Router();
const timeController = require('./time.controller');

router.route('/').get(timeController.findAll);

module.exports = router;
