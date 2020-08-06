const Shop = require('../shop/shop.model');
const Order = require('../order/order.model');
const User = require('../user/user.model.js');

const { getDifferentTimes, getTimes } = require('./time.service')
const moment = require('moment');
moment.locale('fr');

exports.findAll = async (req, res, next) => {
  try {
    let shopsSet = Array.from(new Set(req.query.shops.split(",")));
    let foundTimes = []
    let tmpTimes = []
    let deliveryMan = {}
    console.log(shopsSet);
    // Shop times
    for (let i=0; i<shopsSet.length; i++) {
      const shop = shopsSet[i];
      const foundShop = await Shop.findById(shop, "_id name openings").lean();

      // Livreur
      deliveryMan = await User.findOne({_id: { $in: [req.query.deliverymen]}}).lean();

      // Commandes en cours
      const orders = await Order.find({ shop, selectedTime: { $gte: new Date() }});
      const unavailableTimes = ['2020-09-01 20:00', '2020-09-01 19:00', '2020-09-01 21:00', '2020-08-22 08:00', '2020-08-22 09:00',
    '2020-08-25 18:00', '2020-08-25 19:00', '2020-08-25 20:00', '2020-08-25 21:00',
  '2020-08-29 08:00', '2020-08-29 09:00',
'2020-09-01 18:00', '2020-09-01 19:00', '2020-09-01 20:00', '2020-09-01 21:00',
'2020-09-05 08:00', '2020-09-05 09:00']; // TODO limit to x orders by times // orders ? orders.map(o=>o.selectedTime) : [];
      const shopTimes = getDifferentTimes(moment(), [foundShop.openings]);
      const deliveryTimes = getDifferentTimes(moment(), [deliveryMan.availableTimes]);
      console.log("unavailableTimes1", unavailableTimes);
      tmpTimes.push(getTimes(shopTimes, deliveryTimes, unavailableTimes))
    }
    tmpTimes = tmpTimes.sort((a, b) => (a[0].isoDate > b[0].isoDate) ? 1 : -1)

    const minTime = tmpTimes[tmpTimes.length - 1][0].isoDate;

    tmpTimes[0] = tmpTimes[0].filter(time => {
      return moment(time.isoDate).isAfter(moment(minTime))
    })
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
