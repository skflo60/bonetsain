const Product = require('./api/product/product.model');
const Category = require('./api/category/category.model');
const Coupon = require('./api/order/coupon.model');

module.exports.initialize = () => {
  return {
    Product,
    Category,
    Coupon
  };
};
