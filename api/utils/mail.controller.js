const request = require("superagent");
const moment = require('moment');
const sendMail = require('../utils/mail.service')

exports.sendMail = async (req, res, next) => {
  const { name, email, message } = req.body;
    try {
        let content = `<div>${message}</div>
        <br />
        <br />
        <div>${name}</div>
        <div>${email}</div>`;
        sendMail('fwattier@live.fr', [], {}, null, 'Nouveau message depuis vendezlocal.fr');
      } catch (e) {
        console.log(e);
      }
      res.sendStatus(200);
    };