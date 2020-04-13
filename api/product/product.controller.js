const mongoose = require('mongoose');
const Product = require('./product.model');

exports.findAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pagesize = parseInt(req.query.pagesize) || 8;
    const month = req.query.month
    let filters = {}
    if (month) {
      filters = { months: parseInt(month, 10) }
    }
    filters.shop = new mongoose.Types.ObjectId(req.query.shop)
    const products = await Product.paginate(
      filters,
      { page: page, limit: pagesize }
    );
    console.log(filters, products);
    res.status(200).json({
      products: products.docs,
      currentPage: page,
      pages: products.pages
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.findRelated = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    const productSize = 3;
    const products = await Product.aggregate([
      { $match: { category: product.category, shop: product.shop } },
      { $sample: { size: productSize } }
    ]);
    res.status(200).json({
      products,
      success: true
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.findById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    res.json({ product });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updatedProduct = req.body;
    const product = await Product.update({_id: updatedProduct._id}, updatedProduct);
    res.json(updatedProduct)
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
};
