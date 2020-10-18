const mongoose = require('mongoose');
const Product = require('./product/product.model');
const Shop = require('./shop/shop.model');
const request = require('superagent');
const cheerio = require('cheerio');
require('es6-promise').polyfill();
require('isomorphic-fetch');
const Unsplash = require('unsplash-js').default;
const toJson = require('unsplash-js').toJson;
const crypto = require('crypto');
const fs = require('fs');
var objects = [];

function titleCase(str) {
  var splitStr = str.toLowerCase().split(' ');
  for (var i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  // Directly return the joined string
  return splitStr.join(' ');
}

var ID = function () {
  return '_' + Math.random().toString(36).substr(2, 9);
};

function dataURLtoFile(dataurl, filename) {

  var arr = dataurl.split(','),
  mime = arr[0].match(/:(.*?);/)[1],
  bstr = atob(arr[1]),
  n = bstr.length,
  u8arr = new Uint8Array(n);

  while(n--){
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, {type:mime});
}

function base64MimeType(encoded) {
  var result = null;

  if (typeof encoded !== 'string') {
    return result;
  }

  var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);

  if (mime && mime.length) {
    result = mime[1];
  }

  return result;
}

const loadBase64Image = async (url) => {
  return new Promise((resolve, reject) => {
    // Make request to our image url
    request
    .get(url)
    .end((err, resp) => {
      if (!err) {
        // So as encoding set to null then request body became Buffer object
        resolve('data:' + resp.headers['content-type'] + ';base64,' + resp.body.toString('base64'));
      } else {
        resolve("");
      }
    });
  });
}

const getImageFromUnsplash = async (text) => {
  return new Promise((resolve, reject) => {
    const unsplash = new Unsplash({ accessKey: "dxien-EtOnRWdFYkpkOqPT1tSQjiNNi1VDKLZSDCI8U" });
    unsplash.search.photos(text, 1, 10, { orientation: "portrait" })
    .then(toJson)
    .then(json => {
      if (json.results && json.results[0]) {
        resolve(json.results[0].urls.small);
      } else {
        resolve(null);
      }
    });
  });
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const getHmac = (privateKey, resource, method, date) => {
  var signature = method + resource + date
  return crypto.createHmac('sha1', privateKey).update(signature).digest('hex')
}

const getEMStorageHeaders = (VERB =	"GET", URI = "/objects/:container_id/:object_id", DATETIME = null, octet = false, PUBLIC_KEY = "e10ac08b2019cd2f4b5016f8", PRIVATE_KEY = "2f773541aa16f6ed76aa9811") => {
  const signature = getHmac(PRIVATE_KEY, URI, VERB, DATETIME)
  const headers = {}
  headers["X-Public-Key"] = PUBLIC_KEY
  headers["X-Datetime"] = DATETIME
  headers["X-Signature"] = signature
  if (octet) {
    headers["Content-type"] = 'application/octet-stream'
  }
  return headers
}

const cleanObjects = async (container_id = '5f8c979b090cf818703a8343') => {
  return new Promise(async (resolve, reject) => {
    const headers = getEMStorageHeaders("GET", "/objects/" + container_id, new Date().getTime())
    await request
    .get('https://api.emstorage.fr/objects/' + container_id)
    .set(headers)
    .end(async (err, resp) => {
      console.log(resp.body.objects.length);
      await asyncForEach(resp.body.objects, async object => {
        console.log(object.filename);
        const headers = getEMStorageHeaders("DELETE", "/objects/" + container_id + '/' + object.id, new Date().getTime())
        await request
        .delete('https://api.emstorage.fr/objects/' + container_id + '/' + object.id)
        .set(headers).end((err, res) => {
          console.log(err, object.filename, ' cleaned');
        });
      });
      resolve();
    });
  })
}

const createObject = async (container_id = '5f8c979b090cf818703a8343', object = {}, custom_data = {}) => {
  return new Promise((resolve, reject) => {
    const name = object.name.substring(0, 20);
    const headers = getEMStorageHeaders("POST", "/objects/" + container_id, new Date().getTime())
    request
    .post('https://api.emstorage.fr/objects/' + container_id)
    .set(headers)
    .send({
      "filename": name,
      "custom_data": custom_data,
      "mime": object.mimetype
    })
    .end(async (err, resp) => {
      if (resp.body.success) {
        const base64 = object.data.replace('data:image/png;base64,', '')
        .replace('data:image/jpeg;base64,', '')
        .replace('data:image/gif;base64,', '');
        const buff = new Buffer(base64, 'base64');
        const created_object = resp.body.object;
        const headers = getEMStorageHeaders("POST", '/objects/' + container_id + '/' + created_object.id + '/bytes', new Date().getTime(), true)
        request
        .post('https://api.emstorage.fr/objects/' + container_id + '/' + created_object.id + '/bytes')
        .set(headers)
        .send(buff)
        .end(async (err, r) => {
          if (err) console.log(err);
          resolve(r.body.object)
        })
      } else {
        resolve(err)
      }
    })
  })
}

const getObjects = async (filename = "", container_id = '5f8c979b090cf818703a8343') => {
  return new Promise((resolve, reject) => {
    const headers = getEMStorageHeaders("GET", `/fs/img`, new Date().getTime())
    request
    .get(`https://api.emstorage.fr/fs/img`)
      .set(headers)
      .end(async (err, resp) => {
        resolve(resp.body.objects);
      });
    });
  }

  const mapProduct = async (domElement, category = "5cd9d2e91c9d440000a9b251") => {
    let image = '/legumes.jpg';
    if (domElement.find('img').attr('src') && domElement.find('img').attr('src') !== '') {
      image = await loadBase64Image(domElement.find('img').attr('src'));
    }
    if (!image) {
      const imgUrl = await getImageFromUnsplash(domElement.find('.product-title').text().trim())
      image = await loadBase64Image(imgUrl);
    }
    const file = { name: domElement.find('.product-title').text().trim().toLowerCase(), data: image, mimetype: base64MimeType(image)};
    const shortName = file&&file.name ? file.name.substring(0, 20) : '';
    let object = objects.find(obj => obj.filename===shortName);
    if (!object) {
      object = await createObject('5f8c979b090cf818703a8343', file, {});
    }
    if (!object || !object.public_url || !object.mime) {
      object = { public_url: domElement.find('img').attr('src') };
    } else {
      object.public_url = 'https://' + object.public_url + '?profile=power';
    }
    return {
      name: domElement.find('.product-title').text().trim(),
      price: Math.round(((+(domElement.find('.ty-price-num').text().trim().replace('€', '').replace(',', '.')) + 0.2) * 1.1 + Number.EPSILON) * 10) / 10,
      category,
      shop: "5ed2794fcb7cfe00177a14fa",
      image: object.public_url,
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

    const excludeList = ["BLANQUETTE DE VEAU (FLANCHET) DISPO LE 02..."];
    const allowedProducers = ["COLONEL KEF", "DOMAINE DE MOISMONT", "PARMENTIER FRANCIS", "MIELLERIE DE L'HALLUETTE", "FERME DES COLLINES", "GAEC SAINT GERARD"];

    // await cleanObjects();
    // console.log("EM Storage cleaned");
    setTimeout(async () => {
      await asyncForEach(categs, async categ => {
        try {
          // TODO Delete old products
          // await Shop.deleteMany({ fromDrive: true });
          await Product.deleteMany({ fromDrive: true });

          objects = await getObjects();
          // Clean EM objects
          console.log("1/4 -> Getting products for category " + categ.url.replace("https://drivefermier-somme.fr/amiens/", ""));
          request
          .get(categ.url)
          .withCredentials()
          .then(async result => {
            var $ = cheerio.load(result.text);
            var products = [];

            // For Each Drive product
            var promises = [];
            $('form').each(function (i, elem) {

              if ($(this).find('.product-title').text().trim() !== '') {

                if (allowedProducers.includes($(this).find('.company-name').text().trim())) {

                  if (!excludeList.includes($(this).find('.product-title').text().trim())) {

                    if (!$(this).text().includes('Très prochainement !')
                    && !$(this).text().includes('DISPO LE')
                    && !$(this).text().includes('DISPONIBLE LE')
                    && !$(this).text().includes('Acompte*')) {
                      const product = mapProduct($(this), categ.id);
                      promises.push(product);
                    } // END DISPO

                  }  // END EXCLUDE PRODUCTS

                }  // END ALLOWED PRODUCERS

              } // END PAS DE PRODUIT VIDE

            });  // END FORM EACH

            products = await Promise.all(promises);

            console.log("2/4 -> Preparing products for category " + categ.url.replace("https://drivefermier-somme.fr/amiens/", ""));

            await asyncForEach(products, async product => {
              let producerName = titleCase(product.producerName);

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
              console.log("3/4 -> Upserting product", product.name, product.image);
            });
            console.log("4/4 -> FINISH SUCCESS");
            // Return Sync Success
            return true
          })
        } catch (error) {
          return false
        }
      }); // end for each categ
    }, 5000);
  };

  module.exports = syncDriveFermier;
