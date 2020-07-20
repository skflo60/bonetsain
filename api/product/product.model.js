const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: String,
  price: Number,
  quantity: Number,
  unit: String,
  stock: Number,
  weight: Number,
  category: { type: Schema.ObjectId, ref: 'Category' },
  producer: { type: Schema.ObjectId, ref: 'Shop' },
  image: String,
  description: String,
  shop: { type: Schema.ObjectId, ref: 'Shop' },
  months: [Number]
}, { timestamps: true });

ProductSchema.plugin(mongoosePaginate);

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
