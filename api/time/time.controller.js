const Shop = require('../shop/shop.model');
const Order = require('../order/order.model');
const User = require('../user/user.model.js');

const { getDifferentTimes, getTimes } = require('./time.service')
const moment = require('moment');
moment.locale('fr');

exports.findAll = async (req, res, next) => {
  try {
    let shopsSet = req.query.shops ? Array.from(new Set(req.query.shops.split(","))) : ["5ed2794fcb7cfe00177a14fa"];
    let foundTimes = [];
    let tmpTimes = [];
    let deliveryMan = {};
    let foundShop = null;
    // Shop times
    for (let i=0; i<shopsSet.length; i++) {
      const shop = shopsSet[i];
      foundShop = await Shop.findById(shop, "_id name openings specialty slotDuration deliverable").lean();

      // Horaires de la boutique du vendeur
      const shopTimes = getDifferentTimes(moment(), [foundShop.openings], foundShop.slotDuration);

      if (foundShop.deliverable===true) {
        // Livreur
        deliveryMan = await User.findOne({_id: { $in: [req.query.deliverymen]}}).lean();

        // Commandes en cours
        const orders = await Order.find({ shop, state: "payment_intent.succeeded", selectedTime: { $gte: new Date() }});
        const unavailableTimes = orders ? orders.map(o=>o.selectedTime) : []; // Remove aldready selected slots

        const deliveryTimes = getDifferentTimes(moment(), [deliveryMan.availableTimes], foundShop.slotDuration);

        tmpTimes.push(getTimes(shopTimes, deliveryTimes, unavailableTimes))
      } else {
        tmpTimes.push(getTimes(shopTimes, shopTimes, []));
      }
    }
    tmpTimes = tmpTimes.sort((a, b) => (a[0].isoDate > b[0].isoDate) ? 1 : -1)

    const minTime = tmpTimes[tmpTimes.length - 1][0] ? tmpTimes[tmpTimes.length - 1][0].isoDate : null;

    // If no delivery skip this step
    if (foundShop.deliverable===true) {
      tmpTimes[0] = tmpTimes[0].filter(time => {
        return moment(time.isoDate).diff(moment(minTime)) >= 0;
      });
    }

    res.status(200).json({
      times: tmpTimes[0],
      deliveryMan: deliveryMan._id,
      deliveryEmail: deliveryMan.email
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

exports.findRelated = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id).lean();
    const shopSize = 3;
    const shops = await Shop.aggregate([
      { $match: { category: shop.category } },
      { $sample: { size: shopSize } }
    ]);
    res.status(200).json({
      shops,
      success: true
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.findById = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id).lean();
    res.json({ shop });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updatedShop = req.body;
    const shop = await Shop.update({_id: updatedShop._id}, updatedShop);
    res.json(updatedShop)
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
};
