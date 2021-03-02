const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecipeSchema = new Schema({
  name: String,
  description: String,
  image: String,
  otherProducts: [{ name: String, quantity: String }],
  products: [{ type: Schema.ObjectId, ref: 'Product' }],
  shop: { type: Schema.ObjectId, ref: 'Shop' }
});

const Recipe = mongoose.model('Recipe', RecipeSchema);

module.exports = Recipe;
