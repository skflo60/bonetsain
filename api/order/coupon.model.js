const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

let CouponSchema = mongoose.Schema({
    name: { type: String }, // "35% de réduc sur tel forfait"
    code: { type: String }, // "35OFF"
    percent_off: { type: Number }, // 20
    amount_off: { type: Number },
    times_redeemed: { type: Number, default: 0 }, // Number of times the coupon has been used
    max_redemptions: { type: Number, default: 0 }, // Max Number of times the coupon can be used
    end: {type: Date, default: null }, // Coupon limit date
    state: { type: String }
}, {timestamps: true});

CouponSchema.plugin(mongoosePaginate);

const Coupon = mongoose.model('Coupon', CouponSchema);

module.exports = Coupon;
