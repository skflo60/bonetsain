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
  type: String,
  shop: { type: Schema.ObjectId, ref: 'Shop' },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
