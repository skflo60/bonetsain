const Shop = require('../shop/shop.model');
const Order = require('../order/order.model');
// const DeliveryMen = require('../deliverymen/deliverymen.model');
const { getDifferentTimes } = require('./time.service')
const moment = require('moment');

exports.findAll = async (req, res, next) => {
  try {
    let shops = req.query.shops.split(",");
    let openings = []

    // Shop times
    for (let i=0; i<shops.length; i++) {
      const shop = shops[i];
      const foundShop = await Shop.findById(shop, "_id name opening").lean();
      openings.push(foundShop.opening)
    }

    // Livreur
    // const deliveryMan = await DeliveryMen.findOne().lean();

    // Commandes en cours
    const orders = await Order.find({ deliveryDate: { $gte: new Date() }});
    const unavailableTimes = orders ? orders.map(o=>o.selectedTime) : [];
    const now = moment()
    const foundTimes = getDifferentTimes(now, openings, deliveryMan.availableTimes, unavailableTimes, req.query.duration);

    res.status(200).json({
      times: foundTimes
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
