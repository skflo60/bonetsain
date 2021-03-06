const mongoose = require('mongoose');
const Product = require('./product.model');
const Shop = require('../shop/shop.model');
const request = require('superagent');
const cheerio = require('cheerio');
const { createObject, base64MimeType, isBase64 } = require('../utils/emstorage.service');

exports.findAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pagesize = parseInt(req.query.pagesize) || 40;
    const offset = parseInt(req.query.offset) || 0;
    const month = req.query.month
    let filters = {}
    if (month) {
      filters = { months: parseInt(month, 10) }
    }
    filters.shop = new mongoose.Types.ObjectId(req.query.shop)

    // Filter category
    if (req.query.category) {
      filters.category = new mongoose.Types.ObjectId(req.query.category)
    }

    // Filter producer
    if (req.query.producer) {
      filters.producer = new mongoose.Types.ObjectId(req.query.producer)
    }

    // Filter producer
    if (req.query.search && req.query.search !== '') {
      filters.name = { $regex : new RegExp(req.query.search, "i") };
    }

    // Filter category
    if (req.query.codes) {
      filters.shortcode = { $in: req.query.codes.split(',') };
    }

    filters.active = { $ne: false };

    const products = await Product.find(filters).skip(offset).limit(pagesize).populate({ path: 'producer', select: '-image' }).sort({ name: 1 });

    res.status(200).json({
      products
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

exports.findAllTop = async (req, res, next) => {
  try {
    let filters = {}
    filters.shop = new mongoose.Types.ObjectId(req.query.shop)
    filters.active = { $ne: false };

    const products = await Product.paginate(
      filters,
      { page: 1, offset: 0, limit: 4, populate: { path: 'producer', select: '-image' }, sort: { sells: -1 } }
    );

    res.status(200).json({
      products: products.docs
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

function jsUcfirst(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

exports.findAllFromDrive = async (req, res, next) => {
  try {
   request
  .get('https://drivefermier-somme.fr/amiens/fruits-et-legumes/')
  .withCredentials()
  .then(async result => {
    var $ = cheerio.load(result.text);
    var products = [];
    // For Each Drive product
    $('form').each(function (i, elem) {
        if ($(this).find('.product-title').text().trim() !== '') {
          products.push({
            name: $(this).find('.product-title').text().trim(),
            price: +($(this).find('.ty-price-num').text().trim().replace('€', '').replace(',', '.')),
            category: "5cd9d2e91c9d440000a9b251",
            shop: "5ed2794fcb7cfe00177a14fa",
            image: $(this).find('img').attr('src'),
            producerName: $(this).find('.company-name').text().trim(),
            description: $(this).find('.product-list-unit-price').text().trim() + `
            `+ $(this).find('.company-name').text().trim()
          })
        }
    });

    await asyncForEach(products, async product => {
      let producerName = jsUcfirst(product.producerName);
      const producer = await Shop.findOne({ name: producerName }).lean();
      product.producer = producer;
    });

    // Return Drive products
    res.status(200).json({ products });
  })
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

exports.findRelated = async (req, res, next) => {
  try {
    let products = [];
    const product = await Product.findById(req.params.id).populate("shop").populate("producer").lean();
    if (product) {
      const productSize = 3;
      products = await Product.aggregate([
        { $match: { category: product.category, shop: product.shop._id, active: { $ne: false } } },
        { $sample: { size: productSize } }
      ]);
    }
    res.status(200).json({
      products,
      success: true
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

exports.findById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    res.json({ product });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updatedProduct = req.body;

    // If image is base64 convert it to url
    if (isBase64(updatedProduct.image)) {
      const file = { name: updatedProduct.name + '_' + Math.random().toString(36).substr(2, 9), data: updatedProduct.image, mimetype: base64MimeType(updatedProduct.image)};
      object = await createObject("5f8d55ec03815518b10a4700", file, {});
      updatedProduct.image = "https://" + object.public_url;
    }
    const product = await Product.update({_id: updatedProduct._id}, updatedProduct);
    res.json(updatedProduct)
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await Product.deleteOne({ _id: id });
    res.json(product)
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const createdProduct = req.body;

    // If image is base64 convert it to url
    if (isBase64(createdProduct.image)) {
      const file = { name: createdProduct.name + '_' + Math.random().toString(36).substr(2, 9), data: createdProduct.image, mimetype: base64MimeType(createdProduct.image)};
      object = await createObject("5f8d55ec03815518b10a4700", file, {});
      createdProduct.image = "https://" + object.public_url;
    }

    const product = await Product.create(createdProduct);
    res.json(product)
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
};
