const Order = require('./order.model');
const User = require('../user/user.model');
const Shop = require('../shop/shop.model');
const ACCEPTABLE_DISTANCE = 8000

const sgMail = require('@sendgrid/mail');

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
    console.log(filters, orders);
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

const sendMail = (mail, cart = [], name = "", shop) => {
  sgMail.setApiKey("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");
  const msg = {
    to: mail,
    from: 'contact@localfrais.fr',
    subject: 'Votre commande est prête.',
    html: `Bonjour ${name}
    <strong>Le producteur vient de confirmer qu'il a terminé la préparation de votre commande :</strong>
    ${cart.map(p=>p.name).join(', ')}
    <a href="https://localfrais.fr/shop/${shop}">Voir les horaires de la boutique</a>
    <img width="140" src='https://localfrais.fr/legumes.jpg' />
    `
  };
  sgMail.send(msg);
}

exports.update = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {new:true});
    if (order.state === 'ready') {
      sendMail(order.email, order.cart, order.name, order.shop)
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
