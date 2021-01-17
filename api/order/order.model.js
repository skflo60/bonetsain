const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  reference: String,
  subscription: Boolean,
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
  deliveryMan: { type: Schema.ObjectId, ref: 'User' },
  discount: { start: { type: Date}, end: { type: Date }, coupon: { type: Schema.ObjectId, ref: 'Coupon' } },
  coupon: Object,
  pourboires: Array,
  invoice: String,
  deliveryEmail: String,
  session_id: String, // Stripe session id
  state: String,
  isPaid: Boolean,
  total_ttc: Number,
  total_net: Number
}, { timestamps: true });

OrderSchema.plugin(mongoosePaginate);

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
