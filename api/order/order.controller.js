const Order = require('./order.model');
const User = require('../user/user.model');
const Shop = require('../shop/shop.model');
const ACCEPTABLE_DISTANCE = 4000

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
