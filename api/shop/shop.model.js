const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const ShopSchema = new Schema({
  name: String,
  description: String,
  image: String,
  background: String,
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
  facebook: String,
  instagram: String,
  twitter: String,
  linkedin: String,
  website: String,
  orderable: { type: Boolean, default: true },
  days: { monday: {}, tuesday: {}, wednesday: {}, thursday: {}, friday: {}, saturday: {}, sunday: {} },
  openings: [{weekday: Number, start: String, end: String}],
  affiliatedShop: { type: Schema.ObjectId, ref: 'Shop' },
  specialty: String, // restaurant, epicerie
  fromDrive: Boolean,
  services: [String]
});

ShopSchema.index({ "location" : "2dsphere" })

ShopSchema.plugin(mongoosePaginate);

const Shop = mongoose.model('Shop', ShopSchema);

module.exports = Shop;
