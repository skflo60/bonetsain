const bcrypt = require('bcrypt');
const User = require('./user.model');
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
      const { username, password } = req.body;
      const hash = await bcrypt.hash(password, saltRounds);

      const user = new User({
        username,
        password: hash
      });

      const persistedUser = await user.save();

      res.status(201).json({
        success: true
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }
};
