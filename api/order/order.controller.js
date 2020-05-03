const Order = require('./order.model');
const User = require('../user/user.model');
const Shop = require('../shop/shop.model');
const moment = require('moment');
const ACCEPTABLE_DISTANCE = 8000

const sendMail = require('../utils/mail.service')

exports.findAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pagesize = parseInt(req.query.pagesize) || 40;
    const month = req.query.month
    let filters = {}
    filters.shop = req.query.shop
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

exports.update = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {new:true});
    if (order.state === 'ready') {
      let content = `<div>Bonjour ${order.name||''}</div>
      <strong>Le producteur vient de confirmer qu'il a terminé la préparation de votre commande :</strong>
      <div>${order.cart.map(p=>p.name).join(', ')}</div>
      <div>Vous pourrez venir la chercher quand vous le souhaitez sur les horaires d'ouverture :</div>
      <a href="https://localfrais.fr/shop/${order.shop}">Voir les horaires du producteur</a>
      <br />
      <img width="100" src='https://localfrais.fr/legumes.jpg' />
      <div>L'équipe Local & Frais</div>`
      if (order.deliveryMan && order.deliveryEmail) {
        // For delivery man
        content = content + `
        <div>Date et heure de livraison souhaitée : ${moment(order.selectedTime).format("dddd DD MMMM YYYY [à] HH[h]mm")}</div>
        <div><a href="https://maps.google.com/?q=${encodeURIComponent(order.foundAddress.label)}">${order.foundAddress.label || order.address}</div>`
        sendMail(order.deliveryEmail, order.cart, order, content, subject = 'Une commande est prête à être livrée')
      } else {
        sendMail(order.email, order.cart, order, content, subject = 'Votre commande est prête')
      }
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
    const deliveryMenNearUser = await User.aggregate([{
      $geoNear: {
        near: { type: "Point", coordinates: [ lng, lat ] },
        key: "location",
        maxDistance: ACCEPTABLE_DISTANCE,
        query: { type: 'deliveryman' },
        distanceField: "dist.calculated"
      }
    }])
    const deliveryMenNearShop = await User.aggregate([{
      $geoNear: {
        near: shop.location,
        key: "location",
        maxDistance: ACCEPTABLE_DISTANCE,
        query: { type: 'deliveryman' },
        distanceField: "dist.calculated"
      }
    }])
    var deliveryMen = deliveryMenNearShop.filter(n => !deliveryMenNearUser.some(n2 => n._id == n2._id));
    res.json({ result: deliveryMen.length, deliveryMen });
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
};
