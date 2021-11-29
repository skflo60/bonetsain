const express = require('express');
const router = express.Router();
const mailController = require('./mail.controller');

router.route('/').post(mailController.sendMail);

module.exports = router;
