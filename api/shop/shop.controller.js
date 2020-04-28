const Shop = require('./shop.model');

exports.findAll = async (req, res, next) => {
  try {
    let filters = {}
    let shops = []
    if (req.query.lat && req.query.lng) {
      let lat = parseFloat(req.query.lat)
      let lng = parseFloat(req.query.lng)
      shops = await Shop.aggregate([{
        $geoNear: {
          near: { type: "Point", coordinates: [ lng, lat ] },
          key: "location",
          distanceField: "dist.calculated"
        }
      }])
    } else {
      shops = await Shop.find()
    }
    res.status(200).json({shops});
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
};

exports.findRelated = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id).lean();
    const shopSize = 3;
    const shops = await Shop.aggregate([
      { $match: { category: shop.category } },
      { $sample: { size: shopSize } }
    ]);
    res.status(200).json({
      shops,
      success: true
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.findById = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id).lean();
    // Todo is Open
    res.json({ shop });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updatedShop = req.body;
    updatedShop.openings = []
    Object.keys(updatedShop.days).forEach((day, i) => {
      dayTimes = updatedShop.days[day].forEach(time => {
        if (time.isOpen) {
          const start = time.open.substring(0, 2) + ':' + time.open.substring(2)
          const end = time.close.substring(0, 2) + ':' + time.close.substring(2)
          updatedShop.openings.push({weekday: i, start, end})
        }
      })
    });

    const shop = await Shop.update({_id: updatedShop._id}, updatedShop);
    res.json(updatedShop)
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
};
