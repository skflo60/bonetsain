const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const DeliveryMenSchema = new Schema({
  name: String,
  description: String,
  image: String,
  services: [String]
});

DeliveryMenSchema.plugin(mongoosePaginate);

const DeliveryMen = mongoose.model('DeliveryGuy', DeliveryMenSchema);

module.exports = DeliveryMen;
