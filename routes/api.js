var express = require('express');
var router = express.Router();
const User = require('../schemas/user');
const ParticleDevice = require('../schemas/particleDevice');
const jwt = require('jwt-simple');
var bcrypt = require('bcryptjs');
const axios = require('axios');
const endOfDay = require('date-fns/endOfDay');
const startOfDay = require('date-fns/startOfDay');

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
      ['email', 'lastAccess', 'devices', 'devices_added', 'recent_settings'],
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

router.get('/auth_home', function (req, res) {
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
    User.findOne({ email: decoded.email }, ['email'], (err, user) => {
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
    });
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
    device_name: req.body.deviceName || '',
    device_id: req.body.deviceID,
  };

  const defaultSettings = {
    frequency: 30,
    start_time: 21600,
    end_time: 79200,
  };

  try {
    // Get user from the database
    User.findOneAndUpdate(
      {
        email: req.body.email,
      },
      {
        $inc: { devices_added: 1 },
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
    // const particleRoute = 'https://api.particle.io/v1/devices';
    // const responseFromParticle = axios.post(
    //   `https://api.particle.io/v1/devices/${req.body.deviceID}/heart`
    // );
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'A database error has occured. Please try again',
    });
  }
});

router.post('/update_measurement_settings', function (req, res) {
  const { email, deviceID, setting_name, frequency, start_time, end_time } =
    req.body;

  const updatingObject = {
    ...(frequency.hasChanged && {
      'devices.$.measurement_settings.frequency': frequency.value,
    }),
    ...(start_time.hasChanged && {
      'devices.$.measurement_settings.start_time': start_time.value,
    }),
    ...(end_time.hasChanged && {
      'devices.$.measurement_settings.end_time': end_time.value,
    }),
  };

  const settings = {
    setting_name: setting_name,
    frequency: frequency.value,
    start_time: start_time.value,
    end_time: end_time.value,
  };

  try {
    User.updateOne(
      {
        email: email,
        'devices.device_id': deviceID,
      },
      {
        $set: updatingObject,
        $push: {
          recent_settings: {
            $each: [settings],
            $slice: -3,
          },
        },
      },
      (error, success) => {
        if (error) {
          res.status(400).json({
            success: false,
            message: 'Cannot update the measurement settings.',
          });
        } else {
          res.status(201).json({
            success: true,
            message:
              'Measurement settings have been updated and the settings have been stored!',
          });
        }
      }
    );
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'A database error has occured. Please try again',
    });
  }
});

router.post('/particle/report', function (req, res) {
  const { data, coreid: deviceID, published_at } = req.body;
  const [heartRate, oxygenLevel] = data.split(',').map((d) => parseInt(d));

  const report = {
    stored_at: new Date(),
    published_at: new Date(published_at),
    data: {
      heart_rate: heartRate,
      oxygen_level: oxygenLevel,
    },
  };

  try {
    ParticleDevice.findOneAndUpdate(
      { device_id: deviceID },
      {
        $push: {
          reports: report,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
      (err, doc) => {
        if (err) {
          res.status(401).json({ success: false, err: err });
        } else {
          res.status(201).json({
            success: true,
            message: 'The new report has been saved!',
          });
        }
      }
    );
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'A database error has occured. Please try again',
    });
  }
});

router.get(
  '/particle/device_report_daily/:deviceID/:date',
  function (req, res) {
    const { deviceID, date } = req.params;
    try {
      ParticleDevice.aggregate(
        [
          {
            $match: {
              device_id: deviceID,
            },
          },
          {
            $unwind: '$reports',
          },
          {
            $match: {
              'reports.published_at': {
                $gte: new Date(new Date(date).setUTCHours(0, 0, 0, 0)),
                $lte: new Date(new Date(date).setUTCHours(23, 59, 59, 999)),
              },
            },
          },
          {
            $replaceRoot: {
              newRoot: {
                published_at: '$reports.published_at',
                data: '$reports.data',
              },
            },
          },
        ],
        (err, reports) => {
          if (err) {
            res.status(400).json({
              success: false,
              message: 'The date requested is invalid.',
            });
          } else {
            if (reports.length > 0) {
              res.status(201).json({
                success: true,
                message: 'The data for the requested date has been found.',
                data: reports,
              });
            } else {
              res.status(404).json({
                success: false,
                message: 'The data for the requested date was not found.',
              });
            }
          }
        }
      );
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'A database error has occured. Please try again',
      });
    }
  }
);

router.get('/particle/device_report_weekly/:deviceID', function (req, res) {
  const { deviceID } = req.params;

  const date = new Date();
  const yesterday = new Date(date.setDate(date.getDate() - 1));
  const lastWeek = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate() - 6
  );
  const upperBound = new Date(yesterday.setUTCHours(23, 59, 59, 999)); // last moment of the 'week'
  const lowerBound = new Date(lastWeek.setUTCHours(0, 0, 0, 0)); // first moment of the 'week'

  try {
    ParticleDevice.aggregate(
      [
        {
          $match: {
            device_id: deviceID,
          },
        },
        {
          $unwind: '$reports',
        },
        {
          $match: {
            'reports.published_at': {
              $gte: lowerBound,
              $lte: upperBound,
            },
          },
        },
        {
          $group: {
            _id: '$_id',
            max_heart_rate: { $max: '$reports.data.heart_rate' },
            min_heart_rate: { $min: '$reports.data.heart_rate' },
            avg_heart_rate: { $avg: '$reports.data.heart_rate' },
            max_oxygen_level: { $max: '$reports.data.oxygen_level' },
            min_oxygen_level: { $min: '$reports.data.oxygen_level' },
            avg_oxygen_level: { $avg: '$reports.data.oxygen_level' },
          },
        },
      ],
      (err, reports) => {
        if (err) {
          res.status(400).json({
            success: false,
            message: 'The date requested is invalid.',
          });
        } else {
          res.status(201).json({
            success: true,
            message: 'The data for the requested date has been found.',
            data: reports,
          });
        }
      }
    );
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'A database error has occured. Please try again',
    });
  }
});

module.exports = router;
