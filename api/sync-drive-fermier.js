const mongoose = require('mongoose');
const Product = require('./product/product.model');
const Shop = require('./shop/shop.model');
const request = require('superagent');
const cheerio = require('cheerio');

function jsUcfirst(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const mapProduct = (domElement) => {
	return {
            name: domElement.find('.product-title').text().trim(),
            price: Math.round((+(domElement.find('.ty-price-num').text().trim().replace('€', '').replace(',', '.')) * 1.2 + Number.EPSILON) * 10) / 10,
            category: "5cd9d2e91c9d440000a9b251",
            shop: "5ed2794fcb7cfe00177a14fa",
            image: domElement.find('img').attr('src'),
            producerName: domElement.find('.company-name').text().trim(),
            fromDrive: true,
            description: ''
          };
}

const syncDriveFermier = async () => {
try {
	// TODO Delete old products
  // await Shop.deleteMany({ fromDrive: true });
  await Product.deleteMany({ fromDrive: true });
	console.log("1/4 -> Getting products");
   request
  .get('https://drivefermier-somme.fr/amiens/fruits-et-legumes/')
  .withCredentials()
  .then(async result => {
    var $ = cheerio.load(result.text);
    var products = [];

    // For Each Drive product
    $('form').each(function (i, elem) {
        if ($(this).find('.product-title').text().trim() !== '') {
          products.push(mapProduct($(this)));
        }
    });
    console.log("2/4 -> Preparing products", products);

    await asyncForEach(products, async product => {
		let producerName = jsUcfirst(product.producerName);
		
    let producer = await Shop.findOneAndUpdate({name: producerName}, { name: producerName, affiliatedShop: "5ed2794fcb7cfe00177a14fa", fromDrive: true}, {
      new: true,
      upsert: true // Make this update into an upsert
    });
		product.producer = producer;

		// Insert Product If Does't exist
		  let doc = await Product.findOneAndUpdate({name: product.name}, product, {
		new: true,
		upsert: true // Make this update into an upsert
		});
		console.log("3/4 -> Upserting product", product);
    });
    console.log("4/4 -> FINISH SUCCESS");
    // Return Sync Success
   return true
  })
  } catch (error) {
    return false
  }
};

module.exports = syncDriveFermier;
