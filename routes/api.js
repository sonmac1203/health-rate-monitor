var express = require('express');
var router = express.Router();
const User = require('../schemas/user');
const jwt = require('jwt-simple');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res) => {
  const email = req.body.email;
  const password = req.body.email;

  const newUser = new User({
    email: email,
    passwordHash: password,
  });

  newUser.save((err, user) => {
    if (err) {
      res.status(400).json({
        success: false,
        err: err,
      });
    } else {
      res.status(201).json({
        success: true,
        message: 'Account has been created!',
      });
    }
  });
});

module.exports = router;
