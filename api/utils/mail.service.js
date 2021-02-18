"use strict";
const nodemailer = require("nodemailer");
const moment = require("moment");

// async..await is not allowed in global scope, must use a wrapper
async function sendMail(shopMail, cart = [], order = {}, content = null, subject = 'Nouvelle commande !') {
  const htmlContent = content || `
  <img width="100" src='https://localfrais.fr/legumes.jpg' /><br />
  <strong>Une nouvelle commande vient d'être validée</strong>
  <div>${cart.map(p=>p.name).join(', ')}<div>
  <div><a href="https://localfrais.fr/order/${order._id}">Lien vers la commande</a></div>
  ${order.delivery?'Date de livraison ' + order.selectedTime:''}`
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "mail42.lwspanel.com",
    port: 587,
    auth: {
      user: "contact@localfrais.fr",
      pass: process.env.mail_pwd
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Florian de Local & Frais 🥕" <contact@localfrais.fr>', // sender address
    to: shopMail, // list of receivers
    cc: 'contact@localfrais.fr',
    subject, // Subject line
    html: htmlContent
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}

module.exports = sendMail;
