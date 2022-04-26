const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: String,
  reference: String,
  shortcode: String,
  basePrice: Number,
  price: Number,
  costPrice: Number,
  quantity: Number,
  costPrice: Number,
  deposit: Number,
  unit: String,
  stock: Number,
  weight: Number,
  category: { type: Schema.ObjectId, ref: 'Category' },
  producer: { type: Schema.ObjectId, ref: 'Shop' },
  image: String,
  description: String,
  customFields: [Object],
  alcohol: Boolean,
  bio: Boolean,
  shop: { type: Schema.ObjectId, ref: 'Shop' },
  months: [Number],
  sells: Number,
  fromDrive: Boolean,
  fromBox: Boolean,
  active: Boolean
}, { timestamps: true });

ProductSchema.plugin(mongoosePaginate);

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
