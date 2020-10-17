const { Coupon } = require('./coupon.model');

/**
* @swagger
* /coupon:
*   post:
*     tags:
*       - Coupon
*     description: Add a coupon
*     produces:
*       - application/json
*     parameters:
*       - name: "coupon"
*         in: "body"
*         description: "coupon to add"
*         required: true
*     security:
*        - bearer: []
*     responses:
*        201:
*          description: "Created"
*        400:
*          description: "Invalid name supplied"
*        401:
*          $ref: '#/responses/UnauthorizedError'
*/
const create = async function(req, res) {
  const coupon_infos = req.body;
  let err, existing_coupon;

  let new_coupon;
  [err, new_coupon] = await to(Coupon.create(coupon_infos));

  if(err) return ReE(res, err, 422);

  return ReS(res, {new_coupon: new_coupon.toWeb()}, 201);
};

/**
* @swagger
* response:
*  UnauthorizedError:
*    description: Authentication information is missing or invalid
* /coupons:
*   get:
*     tags:
*       - Coupon
*     description: Returns all coupons
*     produces:
*       - application/json
*     security:
*        - bearer: []
*     responses:
*      200:
*        description: "successful operation"
*        schema:
*          $ref: '#/definitions/Coupon'
*      401:
*          $ref: '#/responses/UnauthorizedError'
*/
const getAll = async function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  let err, coupons;
  let filters = {};
  if (req.query.code) {
    const limitDateCondition = { $or: [ { end: { $gte: new Date() } }, { end: null } ] };
    filters = {
      $and: [
        limitDateCondition,
        { code: req.query.code }
      ]
    };
  }
  console.log(filters);
  [err, coupons] = await to(Coupon.find(filters).sort({ createdAt: -1 }));
  return ReS(res, {coupons});
};

const getOne = async function(req, res) {}

const update = async function(req, res) {}

const remove = async function(req, res) {
  let coupon, err;
  [err, coupon] = await to(Coupon.findOneAndRemove({ _id: req.params.uid }));
  console.log(err, "deleted", coupon);
  return ReS(res, true);
}

module.exports = { create, getAll, getOne, update, remove };
