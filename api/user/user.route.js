const express = require('express');
const router = express.Router();
const userController = require('./user.controller');

router.route('/login').post(userController.login);
router.route('/logout').post(userController.logout);
router.route('/signup').post(userController.signup);

module.exports = router;
