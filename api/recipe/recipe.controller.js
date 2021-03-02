const Recipe = require('./recipe.model');
const mongoose = require('mongoose');
const { createObject, base64MimeType, isBase64 } = require('../utils/emstorage.service');

exports.findAll = async (req, res, next) => {
  try {
    let filters = {}
    let recipes = []
    recipes = await Recipe.find(filters)
    res.status(200).json({recipes});
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

exports.findRelated = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id).lean();
    const recipeSize = 3;
    const recipes = await Recipe.aggregate([
      { $match: { category: recipe.category } },
      { $sample: { size: recipeSize } }
    ]);
    res.status(200).json({
      recipes,
      success: true
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.findById = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate("products").lean();
    res.status(200).json({ recipe });
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updatedRecipe = req.body;
    updatedRecipe.openings = []
    const recipe = await Recipe.update({_id: updatedRecipe._id}, updatedRecipe);
    res.json(updatedRecipe);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};


exports.create = async (req, res, next) => {
  try {
    const createdRecipe = req.body;
    const recipe = await Recipe.create(createdRecipe);
    res.json(recipe);
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
};
