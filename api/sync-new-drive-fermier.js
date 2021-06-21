const cheerio = require('cheerio');
const request = require('superagent');
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const moment = require('moment');
const Product = require('./product/product.model');
const Shop = require('./shop/shop.model');
require('es6-promise').polyfill();
require('isomorphic-fetch');
const Unsplash = require('unsplash-js').default;
const toJson = require('unsplash-js').toJson;
const crypto = require('crypto');
const fs = require('fs');
var objects = [];
var updateImg = false;


async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

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

const getObjects = async (offset = 0, limit = 50, container_id = '5f8d55ec03815518b10a4700') => {
  return new Promise((resolve, reject) => {
    const headers = getEMStorageHeaders("GET", `/objects/${container_id}?offset=${offset}&limit=0`, new Date().getTime())
    request
    .get(`https://api.emstorage.fr/objects/${container_id}?offset=${offset}&limit=0`)
      .set(headers)
      .end((err, resp) => {
        if (err) console.log(err);
        resolve(resp.body.objects);
      });
    });
  }

  function delay(time) {
    return new Promise(function(resolve) {
      setTimeout(resolve, time)
    });
  }

  function getNextFridayDate() {
    if (Number(moment().day()) >= 3) {
      return moment().startOf('isoWeek').add(1, 'week').day(5).format("DD/MM/YYYY");
    } else {
      return moment().startOf('isoWeek').day(5).format("DD/MM/YYYY");
    }
  }

  const mapName = (name = "") => {
    const mapper = {
      "Betterave mélanger 1 kg": "Betteraves mélangées (1kg)",
      "Carotte melanger 1 kg": "Mélange de carottes (1kg)",
      "Poireaux la botte 1 l": "Poireaux (la botte)"
    }
    return mapper[name] || name;
  }

  const mapProduct = async ($, category = "5cd9d2e91c9d440000a9b251") => {
    let image = '/legumes.jpg';
    const showedPrice = Math.round(((+($('.prix').text().trim().replace('€', '').replace(',', '.')) + 0.2) * 1.2 + Number.EPSILON) * 10) / 10;
    return {
      name: mapName($('.bv_pdt_titre > h2').text().trim()),
      reference: mapName($('.bv_pdt_titre > h2').text().trim()),
      price: showedPrice,
      category,
      shop: "5ed2794fcb7cfe00177a14fa",
      image,
      producerName: $(".bv_pdt_titre > .bv_pdt_producteur").text().trim(),
      fromDrive: true,
      description: `Origine: France
      ${$('.bv_pdt_cond').text().trim()}`,
      active: true
    };
  }

  const syncDriveFermier = () => {

    (async () => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.setRequestInterception(true);
      // add header for the navigation requests
      page.on('request', request => {
        // Do nothing in case of non-navigation requests.
        if (!request.isNavigationRequest()) {
          request.continue();
          return;
        }
        // Add a new header for navigation request.
        const headers = request.headers();
        headers['cookie'] = "AFFICHER_DISPO_BV=0; JSESSIONID=AAA7F9A713F8D87055E9702D450DBF04; DWRSESSIONID=KNAU7c2424zyti~Ly44KhYHhmgfkAH4K6Bn";
        request.continue({ headers });
      });

      await page.goto('https://somme80.drive-fermier.fr/bv.stp?ACTION=RECHERCHE&ID_FOURNISSEUR=471712', {
        waitUntil: 'networkidle2',
      });

      await delay(3000);

      await page.waitForSelector('.resume-bloc');

      await page.click('.resume-bloc .bouton_action');

      await delay(3000);

      await page.click('.resume-bloc .bouton_action');

      await delay(3000);

      await page.click('.resume-bloc .bouton_action');

      let selector = 'input[type=radio]';

      await page.evaluate(()=>{
        if (document.querySelector('input[type=radio]')) {
          document.querySelector('input[type=radio]').click()
        };
      })

      const friday = getNextFridayDate();

      await page.evaluate((friday) => {
        validerDate(friday);
      }, friday);

      await delay(4000);

      await page.screenshot({path: 'buddy-screenshot3.png'});

      const text = await page.evaluate(() => Array.from(document.querySelectorAll('.bv_pdt'), element => element.innerHTML));

      await Product.updateMany({ fromDrive: true, shop: "5ed2794fcb7cfe00177a14fa" }, { active: false });

      var promises = [];
      await text.forEach(t => {
        const $ = cheerio.load(t);
        // Pour chaque produit
        if ($(".bv_pdt_titre > .bv_pdt_producteur").text().includes('LC BIO')) {
          const product = mapProduct($);
          promises.push(product);
        }
      });
      products = await Promise.all(promises);

      await asyncForEach(products, async product => {
        let producerName = titleCase(product.producerName);

        let producer = await Shop.findOneAndUpdate({name: producerName, affiliatedShop: "5ed2794fcb7cfe00177a14fa"}, { name: producerName, affiliatedShop: "5ed2794fcb7cfe00177a14fa", fromDrive: true}, {
          new: true,
          upsert: true // Make this update into an upsert
        });
        product.producer = producer;
        let doc = null;
        product.active = true;
        const foundProduct = await Product.findOne({reference: product.name, shop: "5ed2794fcb7cfe00177a14fa"});
        if (foundProduct) {
          // Insert Product If Does't exist
          doc = await Product.findOneAndUpdate({ reference: product.name }, { active: true }, {
            new: true
          });
          console.log("3/4 -> Updating product", product.name, product.image);
        } else {
          doc = await Product.create(product);
          console.log("3/4 -> Adding product", product.name, product.image);
        }
      });
      await browser.close();
    })();

  }

  module.exports = syncDriveFermier;
