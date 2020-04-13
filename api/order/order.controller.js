const Order = require('./order.model');

exports.findAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pagesize = parseInt(req.query.pagesize) || 8;
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
