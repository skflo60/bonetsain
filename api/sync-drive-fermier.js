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

const mapProduct = (domElement, category = "5cd9d2e91c9d440000a9b251") => {
	return {
            name: domElement.find('.product-title').text().trim(),
            price: Math.round(((+(domElement.find('.ty-price-num').text().trim().replace('€', '').replace(',', '.')) + 0.2) * 1.1 + Number.EPSILON) * 10) / 10,
            category,
            shop: "5ed2794fcb7cfe00177a14fa",
            image: domElement.find('img').attr('src'),
            producerName: domElement.find('.company-name').text().trim(),
            fromDrive: true,
            description: ''
          };
}

const syncDriveFermier = async () => {
  const categs = [
  { id: "5cd9d2e91c9d440000a9b251", url: "https://drivefermier-somme.fr/amiens/fruits-et-legumes/" },
  { id: "5f039104ceceb9b99d12ef45", url: "https://drivefermier-somme.fr/amiens/viandes-et-poissons/" },
  { id: "5f039104ceceb9b99d12ef45", url: "https://drivefermier-somme.fr/amiens/volailles-et-oeufs/" },
  { id: "5f037fd2ceceb9b99d12ef44", url: "https://drivefermier-somme.fr/amiens/produits-laitiers/" },
  { id: "5f037f9aceceb9b99d12ef42", url: "https://drivefermier-somme.fr/amiens/epicerie-sucree/" },
  { id: "5f037f9aceceb9b99d12ef42", url: "https://drivefermier-somme.fr/amiens/boulangerie-et-patisserie/" },
  { id: "5f037fb1ceceb9b99d12ef43", url: "https://drivefermier-somme.fr/amiens/epicerie-salee/" },
  { id: "5f65f3e487f96cd7362a9287", url: "https://drivefermier-somme.fr/amiens/boissons-et-alcools/" },
];

const excludeList = [];

await asyncForEach(categs, async categ => {
  try {
  	// TODO Delete old products
    // await Shop.deleteMany({ fromDrive: true });
    await Product.deleteMany({ fromDrive: true });
  	console.log("1/4 -> Getting products for category " + categ.url.replace("https://drivefermier-somme.fr/amiens/", ""));
     request
    .get(categ.url)
    .withCredentials()
    .then(async result => {
      var $ = cheerio.load(result.text);
      var products = [];

      // For Each Drive product
      $('form').each(function (i, elem) {
          if ($(this).find('.product-title').text().trim() !== '') {
            if (!excludeList.includes(domElement.find('.product-title').text().trim())) {
              if (!$(this).text().includes('Très prochainement !') && !$(this).text().includes('Dispo le ') ) {
                products.push(mapProduct($(this), categ.id));
              }
            }
          }
      });
      console.log("2/4 -> Preparing products for category " + categ.url.replace("https://drivefermier-somme.fr/amiens/", ""), products);

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
  }); // end for each categ
};

module.exports = syncDriveFermier;
