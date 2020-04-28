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
  location: {
    type: { type: String },
    coordinates: [Number],
  },
  type: String,
  shop: { type: Schema.ObjectId, ref: 'Shop' },
});

const User = mongoose.model('User', UserSchema);

UserSchema.index({ "location" : "2dsphere" })

module.exports = User;
