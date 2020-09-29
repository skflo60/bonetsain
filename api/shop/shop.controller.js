const Shop = require('./shop.model');
const getDayNumberFromName = require('../utils/helpers.service')
const { isShopOpen } = require('../time/time.service')
const mongoose = require('mongoose');

exports.findAll = async (req, res, next) => {
  try {
    let filters = {}
    let shops = []

    if (req.query.onlyFarmers==='true') {
      filters.affiliatedShop = { $ne: null };
    }
    if (req.query.lat && req.query.lng) {
      let lat = parseFloat(req.query.lat)
      let lng = parseFloat(req.query.lng)
      shops = await Shop.aggregate([{
        $geoNear: {
          near: { type: "Point", coordinates: [ lng, lat ] },
          key: "location",
          query: filters,
          distanceField: "dist.calculated"
        }
      }])
    } else {
      shops = await Shop.find(filters)
    }
    res.status(200).json({shops});
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
};

exports.findProducers = async (req, res, next) => {
  try {
    let producers = [];
    const filters = {};
    if (req.params.id) {
      filters.affiliatedShop = new mongoose.Types.ObjectId(req.params.id)
    }
    producers = await Shop.find(filters);
    console.log(filters, producers);
    res.status(200).json({producers});
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
};

exports.createProducer = async (req, res, next) => {
  try {
    const createdProducer = req.body;
    console.log('creating producer', createdProducer);
    const producer = await Shop.create(createdProducer);
    res.json(producer)
  } catch (error) {
    console.log(error)
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
    shop.isOpen = isShopOpen(shop.days);
    res.status(200).json({ shop });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.updateProducer = async (req, res, next) => {
  try {
    const updatedShop = req.body;
    const shop = await Shop.update({_id: updatedShop._id}, updatedShop);
    res.json(updatedShop)
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updatedShop = req.body;
    updatedShop.openings = []
    Object.keys(updatedShop.days).forEach((day, i) => {
      dayTimes = updatedShop.days[day].forEach(time => {
        if (time.isOpen) {
          const start = time.open.substring(0, 2) + ':' + time.open.substring(2)
          const end = time.close.substring(0, 2) + ':' + time.close.substring(2)
          updatedShop.openings.push({weekday: getDayNumberFromName(day), start, end})
        }
      })
    });

    const shop = await Shop.update({_id: updatedShop._id}, updatedShop);
    res.json(updatedShop)
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
};

exports.removeProducer = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await Shop.deleteOne({ _id: id });
    res.json(product)
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};
