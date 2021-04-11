const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  title: String,
  specialty: String,
  shop: { type: Schema.ObjectId, ref: 'Shop' }
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
