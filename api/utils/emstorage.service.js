const crypto = require('crypto');
const request = require('superagent');

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

const createObject = async (container_id = '5f8d55ec03815518b10a4700', object = {}, custom_data = {}, upsert = false) => {
  return new Promise((resolve, reject) => {
    const name = object.name.replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, '_');
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
        // console.log(err);
        resolve(err);
      }
    })
  })
}

const getHmac = (privateKey, resource, method, date) => {
  var signature = method + resource + date
  return crypto.createHmac('sha1', privateKey).update(signature).digest('hex')
}

const isBase64 = (base64) => {
  const regex = /^data:image\/(?:gif|png|jpeg|bmp|webp)(?:;charset=utf-8)?;base64,(?:[A-Za-z0-9]|[+/])+={0,2}/;
  return base64 && regex.test(base64);
}

module.exports = { createObject, base64MimeType, isBase64 };
