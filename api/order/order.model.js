const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  reference: String,
  name: String,
  phone: String,
  email: String,
  delivery: Boolean,
  address: String,
  postalCode: String,
  city: String,
  foundAddress: Object,
  notes: String,
  selectedTime: Date,
  deliveryDate: Date,
  cart: Object,
  shop: { type: Schema.ObjectId, ref: 'Shop' },
  session_id: String, // Stripe session id
  state: String,
  isPaid: Boolean
}, { timestamps: true });

OrderSchema.plugin(mongoosePaginate);

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
