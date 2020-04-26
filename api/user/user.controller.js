const bcrypt = require('bcrypt');
const User = require('./user.model');
const Shop = require('../shop/shop.model');
const saltRounds = 10;

module.exports = {
  login: async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });

      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
          res.status(201).json({
            user,
            success: true
          });
        } else {
          res.status(201).json({
            success: false,
            msg: 'Mauvais login / mot de passe'
          });
        }
      } else {
        res.status(201).json({
          success: false,
          msg: 'Login et mot de passe requis'
        });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  },
  logout: async (req, res, next) => {
    res.status(200).json({
      success: true,
      msg: 'Logout'
    });
  },
  signup: async (req, res, next) => {
    try {
      const { username, password, name, validatedAddress } = req.body;
      const hash = await bcrypt.hash(password, saltRounds);

      const user = await User.findOne({ username });

      if (!user) {
        const shop = new Shop({
          name,
          address: validatedAddress.properties.name,
          postalCode: validatedAddress.properties.postcode,
          city: validatedAddress.properties.city,
          location: validatedAddress.geometry
        });

        const persistedShop = await shop.save();

        const user = new User({
          username,
          password: hash,
          shop: persistedShop._id
        });

        const persistedUser = await user.save();

        res.status(201).json({
          success: true
        });
      } else {
        res.status(400).json("Login déjà pris")
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};
