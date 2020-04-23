const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const ShopSchema = new Schema({
  name: String,
  description: String,
  image: String,
  color: String,
  address: String,
  postalCode: String,
  city: String,
  location: {
    type: { type: String },
    coordinates: [Number],
  },
  phone: String,
  email: String,
  orderable: { type: Boolean, default: true },
  days: [{}],
  openings: [{weekday: Number, start: String, end: String}],
  services: [String]
});

ShopSchema.index({ "location" : "2dsphere" })

ShopSchema.plugin(mongoosePaginate);

const Shop = mongoose.model('Shop', ShopSchema);

module.exports = Shop;
