const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  address: String,
  location: {
    type: { type: String },
    coordinates: [Number],
  },
  type: String,
  days: { monday: {}, tuesday: {}, wednesday: {}, thursday: {}, friday: {}, saturday: {}, sunday: {} },
  availableTimes: [{weekday: Number, start: String, end: String}],
  shop: { type: Schema.ObjectId, ref: 'Shop' },
});

const User = mongoose.model('User', UserSchema);

UserSchema.index({ "location" : "2dsphere" })

module.exports = User;
