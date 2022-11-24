var express = require('express');
var router = express.Router();
const User = require('../schemas/user');
const jwt = require('jwt-simple');
var bcrypt = require('bcryptjs');

const secret = 'supersecret';

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) res.status(401).json({ success: false, err: err });
    else if (user) {
      res.status(401).json({ success: false, msg: 'This email already used' });
    } else {
      const passwordHash = bcrypt.hashSync(req.body.password, 10);
      const newUser = new User({
        email: req.body.email,
        passwordHash: passwordHash,
      });

      newUser.save((err, user) => {
        if (err) {
          res.status(400).json({ success: false, err: err });
        } else {
          const msgStr = `User (${req.body.email}) account has been created.`;
          res.status(201).json({ success: true, message: msgStr });
        }
      });
    }
  });
});

router.post('/login', function (req, res) {
  if (!req.body.email || !req.body.password) {
    res.status(401).json({ error: 'Missing email and/or password' });
    return;
  }
  // Get user from the database
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      res.status(400).send(err);
    } else if (!user) {
      // Username not in the database
      res.status(401).json({ error: 'Login failure!!' });
    } else {
      if (bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.encode({ email: user.email }, secret);
        //update user's last access time
        user.lastAccess = new Date();
        user.save(() => {
          console.log("User's LastAccess has been update.");
        });
        // Send back a token that contains the user's username
        res
          .status(201)
          .json({ success: true, token: token, msg: 'Login success' });
      } else {
        res
          .status(401)
          .json({ success: false, msg: 'Email or password invalid.' });
      }
    }
  });
});

router.get('/auth', function (req, res) {
  // See if the X-Auth header is set
  if (!req.headers['x-auth']) {
    return res
      .status(401)
      .json({ success: false, msg: 'Missing X-Auth header' });
  }
  // X-Auth should contain the token
  const token = req.headers['x-auth'];
  try {
    const decoded = jwt.decode(token, secret);
    User.findOne(
      { email: decoded.email },
      ['email', 'lastAccess', 'devices'],
      (err, user) => {
        if (err) {
          res.status(400).json({
            success: false,
            message: 'Error contacting DB. Please contact support.',
          });
        } else {
          res.status(200).json({
            success: true,
            user: user,
          });
        }
      }
    );
  } catch (ex) {
    res.status(401).json({ success: false, message: 'Invalid JWT' });
  }
});

router.post('/add_new_device', function (req, res) {
  if (!req.body.email || !req.body.deviceID) {
    res.status(401).json({ error: 'Missing email and/or device ID' });
    return;
  }

  const deviceObj = {
    device_id: req.body.deviceID,
  };

  // Get user from the database
  User.findOneAndUpdate(
    {
      email: req.body.email,
    },
    {
      $push: {
        devices: deviceObj,
      },
    },
    (error, success) => {
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Cannot add the new device.',
        });
      } else {
        res
          .status(201)
          .json({ success: true, message: 'Device has been added.' });
      }
    }
  );
});

module.exports = router;
