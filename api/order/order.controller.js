const Stripe = require('stripe');
const request = require("superagent");

const Order = require('./order.model');
const User = require('../user/user.model');
const Shop = require('../shop/shop.model');
const moment = require('moment');

let ACCEPTABLE_DISTANCE = 6000

const sendMail = require('../utils/mail.service')

exports.findAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pagesize = parseInt(req.query.pagesize) || 40;
    const month = req.query.month;
    let filters = {};
    if (req.query.shop) {
      filters.shop = req.query.shop;
    }
    if (req.query.email) {
      filters.email = req.query.email;
    }
    if (req.query.deliveryEmail) {
      var date = new Date();
      date.setHours(0,0,0);
      const minDate = new Date(date);
      date.setHours(23,59,59);
      const maxDate = new Date(date);
      filters.deliveryEmail = req.query.deliveryEmail;
      filters.selectedTime = { $gte: minDate, $lte: maxDate };
      filters.state = { $in: ['paid', 'payment_intent.succeeded'] };
    }
    console.log(filters);
    const orders = await Order.paginate(
      filters,
      { page: page, limit: pagesize, sort: {createdAt: -1} }
    );
    res.status(200).json({
      orders: orders.docs,
      currentPage: page,
      pages: orders.pages
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

exports.findById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    res.json({ order });
  } catch (error) {
    res.status(500).json(error);
  }
};

const createInvoice = async (order = {}) => {
  // Préparation des clés d'api
  const API_URL = 'https://wuro.pro/api/v1/' // Url de base de l'api, Doc complète sur https://wuro.pro/api/v1/docs/#
  const appId = '6004510881e89e7f3fd4074d' // Fourni avec votre espace Wuro > Paramètres > API
  const appSecret = 'tulljrkl6vwzidnmv60cfujhn01sle' // Utilise l'espace test wuro.pro/posao

  // Récupérer un token d'application
  const { auth } = await request.get(`${API_URL}accessToken?app_id=${appId}&&app_secret=${appSecret}`);

  // Préparer sa facture
  const invoice_lines = order.cart.map(p => {
    return { title: p.name, price_ht: p.subtotal, image: p.image };
  });
  const invoice = { client_name: order.name, client_address: order.foundAddress.label, state: 'paid', invoice_lines };

  // Ajouter sa facture
  const { body } = await request.post(API_URL + "invoice", invoice).set({ authorization: auth.token});
  return body.new_invoice.pdf_link;
}

exports.validate = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const body = req.rawBody || req.body;

  let event = body;

  const stripe = new Stripe(process.env.stripe_key);

  try {
    event = stripe.webhooks.constructEvent(body, sig, "whsec_nqawI5DYgkdDqMbXFLlixxKBHHXasTF1");
  } catch (err) {
    console.log(err);
  }

  let intent = null;
  let customer = null;
  intent = event.data.object;
  if (intent.customer) {
    customer = await stripe.customers.retrieve(intent.customer);
  }
  const sessions = await stripe.checkout.sessions.list({ payment_intent: intent.id });
  const session = sessions.data[0];
  var result;
  if (customer) {
    // Find order by session id
    const order = await Order.findOne({ session_id: session.id });
    const invoiceUrl = await createInvoice(order)
    result = await Order.update(
      { session_id: session.id },
      { state: event.type, isPaid: event.type==='payment_intent.succeeded', email: customer.email, invoice: invoiceUrl, name: customer.name },
      { multi: true });
      let content = `<div>Bonjour !</div>
      <br />
      <div>Votre commande est confirmée</b>
      <div>${order.cart.map(p=>p.name).join(', ')}</div>
      <br />
      <div>Les produits seront rassemblés chez les producteurs puis livrés le ${moment(order.selectedTime).format("dddd DD MMMM YYYY [à] HH[h]mm")}</div>
      <div>Résumé de la commande : <a href="https://www.localfrais.fr/order/${order._id}">Lien vers la commande</a>
      <br />
      <div>Bonne journée 🙂</div>
      <br />
      <div>Florian de l'équipe Local & Frais 🥕</div>
      <div>https://localfrais.fr</div>
      <div>06 33 79 85 91</div>`;
      sendMail(order.email, order.cart, order, content, subject = 'Votre commande est confirmée');
    } else {
      result = await Order.update(
        { session_id: session.id },
        { state: event.type, isPaid: event.type==='payment_intent.succeeded' },
        { multi: true });
      }

      res.sendStatus(200);
    };

    exports.update = async (req, res, next) => {
      try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, {new:true});
        if (order.state === 'ready') {
          let content = `<div>Bonjour !</div>
          <br />
          <div>Votre commande est confirmée</b>
          <div>${order.cart.map(p=>p.name).join(', ')}</div>
          <br />
          <div>Les produits seront rassemblés chez les producteurs puis livrés le ${moment(order.selectedTime).format("dddd DD MMMM YYYY [à] HH[h]mm")}</div>
          <div>Résumé de la commande : <a href="https://www.localfrais.fr/order/${order._id}">Lien vers la commande</a>
          <br />
          <div>Bonne journée 🙂</div>
          <br />
          <div>Florian de l'équipe Local & Frais 🥕</div>
          <div>https://localfrais.fr</div>
          <div>06 33 79 85 91</div>`;
          sendMail(order.email, order.cart, order, content, subject = 'Votre commande est confirmée')
        }
        res.json({ order });
      } catch (error) {
        console.log(error);
        res.status(500).json(error);
      }
    };

    exports.isDeliveryPossible = async (req, res, next) => {
      try {
        let lat = parseFloat(req.body.validatedAddress.lat)
        let lng = parseFloat(req.body.validatedAddress.lng)
        const shop = await Shop.findOne({ _id: req.body.shopId }).lean();
        ACCEPTABLE_DISTANCE = (shop.specialty === 'restaurant') ? 1500 : 6000;
        const deliveryMenNearUser = await User.aggregate([{
          $geoNear: {
            near: { type: "Point", coordinates: [ lng, lat ] },
            key: "location",
            maxDistance: ACCEPTABLE_DISTANCE,
            minDistance: 1,
            query: { type: 'deliveryman', specialty: shop.specialty },
            distanceField: "dist.calculated"
          }
        }])
        const deliveryMenNearShop = await User.aggregate([{
          $geoNear: {
            near: shop.location,
            key: "location",
            maxDistance: ACCEPTABLE_DISTANCE,
            query: { type: 'deliveryman', specialty: shop.specialty },
            distanceField: "dist.calculated"
          }
        }])
        var deliveryMen = deliveryMenNearUser.filter(n => !deliveryMenNearShop.some(n2 => n._id == n2._id));
        res.json({ result: deliveryMen.length, deliveryMen });
      } catch (error) {
        console.log(error)
        res.status(500).json(error);
      }
    };
