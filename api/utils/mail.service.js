const mailjet = require('node-mailjet').connect('99a81d385fd2e3a5715357f715c0c2c3', 'f071f86667c981d44961a9958e83d54c')

const sendMail = async (shopMail, cart = [], order = {}) => {
  const request = mailjet
  .post("send", {'version': 'v3.1'})
  .request({
    "Messages":[
      {
        "From": {
          "Email": "contact@localfrais.fr",
          "Name": "Florian de Local&Frais"
        },
        "To": [
          {
            "Email": shopMail,
            "Name": order.name
          }
        ],
        "Subject": "Nouvelle commande !",
        "HTMLPart":
      }
    ]
  }) .then((result) => {
        console.log(result.body);
    })
    .catch((err) => {
        console.log(err, err.statusCode);
    })
};

module.exports = sendMail;
