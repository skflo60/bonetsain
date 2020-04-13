const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const ShopSchema = new Schema({
  name: String,
  description: String,
  image: String,
  color: String,
  openings: [{weekday: Number, start: String, end: String}],
  services: [String]
});

ShopSchema.plugin(mongoosePaginate);

const Shop = mongoose.model('Shop', ShopSchema);

module.exports = Shop;