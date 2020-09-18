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

const mapProduct = (domElement, category = "5f037fd2ceceb9b99d12ef44") => {
  var reg = /(?:\(['"]?)(.*?)(?:['"]?\))/;
	return {
            name: domElement.find('.nom').text().trim(),
            price: Math.round((+(domElement.find('.prix.custom-tooltip').text().trim().replace('€', '').replace(',', '.')) * 1.1 + Number.EPSILON) * 10) / 10,
            category,
            shop: "5ed2794fcb7cfe00177a14fa",
            image: reg.exec(domElement.html())[1],
            producerName: "O Panier Fermier",
            fromBox: true,
            description: domElement.find('.desc').text()
            .replace('Origine France et plus particulièrement à ', '')
            .replace('Origine France et plus particulièrement au', '')
            .replace('Origine France et plus particulièrement dans l’Oise au ', '').trim()
          };
}

const syncOFermier = async () => {
try {
	await Product.deleteMany({ fromBox: true });
	/*console.log("1/4 -> Getting products");
   request
  .get('https://clients.filbingbox.fr/stock/29/O-Panier-Fermier/')
  .withCredentials()
  .end(async (err, res) => {
    var $ = cheerio.load(err.response.text);
    var products = [];

    // For Each Drive product
    $('.bloc_produit').each(function (i, elem) {
        if ($(elem).text().trim() !== '') {
          if (/lait |fromage|chèvre/.test($(elem).find(".nom").text().toLowerCase())) {
            products.push(mapProduct($(elem)));
          }
        }
    });
    console.log("2/4 -> Preparing products", products);

    await asyncForEach(products, async product => {
		let producerName = jsUcfirst(product.producerName);
		
    let producer = await Shop.findOneAndUpdate({name: producerName}, { name: producerName, affiliatedShop: "5ed2794fcb7cfe00177a14fa", fromBox: true}, {
      new: true,
      upsert: true // Make this update into an upsert
    });
		product.producer = producer;

		// Insert Product If Does't exist
		  let doc = await Product.findOneAndUpdate({name: product.name}, product, {
		new: true,
		upsert: true // Make this update into an upsert
		});
		console.log("3/4 -> Upserting product");//, product);
    });
    console.log("4/4 -> FINISH SUCCESS");
    // Return Sync Success
   return true
  })*/
  } catch (error) {
    console.log(error);
    return false
  }
};

module.exports = syncOFermier;
