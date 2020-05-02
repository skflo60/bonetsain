const mailjet = require('node-mailjet').connect('99a81d385fd2e3a5715357f715c0c2c3', 'f071f86667c981d44961a9958e83d54c')

const sendMail = async (shopMail, cart = [], order = {}, content = null, subject = 'Nouvelle commande !') => {
  const htmlContent = content || `
  <img width="100" src='https://localfrais.fr/legumes.jpg' /><br />
  <strong>Une nouvelle commande vient d'être validée</strong>
  <div>${cart.map(p=>p.name).join(', ')}<div>
  <div>Commandée par ${order.name||''} ${order.email||''} ${order.phone||''}</div>
  ${order.delivery?'Date de livraison ' + order.selectedTime:''}`
  try {
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
          "Subject": subject,
          "HTMLPart": htmlContent
        }
      ]
    }).then((result) => {
      console.log(result.body);
    })
    .catch((err) => {
      console.log(err, err.statusCode);
    })
  } catch(e) {
    console.log(e)
  }
};

module.exports = sendMail;