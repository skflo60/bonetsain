const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: String,
  price: Number,
  quantity: Number,
  unit: String,
  stock: Number,
  category: String,
  image: String,
  description: String,
  createdAt: Date,
  months: [Number]
});

ProductSchema.plugin(mongoosePaginate);

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
