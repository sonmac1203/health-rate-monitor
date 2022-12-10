var express = require('express');
var router = express.Router();
const User = require('../schemas/user');
const ParticleDevice = require('../schemas/particleDevice');
const jwt = require('jwt-simple');
var bcrypt = require('bcryptjs');
const axios = require('axios');

const secret = 'supersecret';

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) res.status(401).json({ success: false, err: err });
    else if (user) {
      res
        .status(401)
        .json({ success: false, message: 'This email already used' });
    } else {
      const passwordHash = bcrypt.hashSync(req.body.password, 10);
      const newUser = new User({
        name: req.body.name || 'Anon',
        email: req.body.email,
        passwordHash: passwordHash,
      });

      newUser.save((err, user) => {
        if (err) {
          res.status(400).json({
            success: false,
            err: err,
            message: 'An error has occurred. Please try again.',
          });
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
      res.status(400).send({
        success: false,
        message: 'An error has occurred. Please try again.',
      });
    } else if (!user) {
      // Username not in the database
      res
        .status(401)
        .json({ success: false, message: 'Email not found. Please try again' });
    } else {
      if (bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.encode({ email: user.email }, secret);
        user.lastAccess = new Date();
        user.save(() => {
          console.log("User's LastAccess has been update.");
        });
        res
          .status(201)
          .json({ success: true, token: token, message: 'Login success' });
      } else {
        res.status(401).json({
          success: false,
          message: 'Incorrect password. Please try again.',
        });
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
      [
        'name',
        'email',
        'lastAccess',
        'devices',
        'devices_added',
        'access_token',
      ],
      (err, user) => {
        if (err) {
          res.status(400).json({
            success: false,
            message: 'Cannot find the user. Please try again',
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

router.post('/update_profile', function (req, res) {
  // const { name, email, currentPassword, newPassword } = req.body;
  const { email, name, password } = req.body;

  const { update: nameUpdate, value: nameValue } = name;
  const { update: passwordUpdate, value: passwordValue } = password;

  User.findOne({ email: email }, (err, user) => {
    if (err) {
      res.status(400).send(err);
    } else if (!user) {
      res.status(401).json({ error: 'Login failure!!' });
    } else {
      if (passwordUpdate) {
        if (
          bcrypt.compareSync(passwordValue.currentPassword, user.passwordHash)
        ) {
          user.passwordHash = bcrypt.hashSync(passwordValue.newPassword, 10);
        } else {
          res.status(201).json({
            success: false,
            message: 'Current password do not match. Please try again.',
          });
          return;
        }
      }
      if (nameUpdate) {
        user.name = nameValue;
      }
      user.save(() => {
        console.log('User profile has been updated.');
      });
      res.status(201).json({
        success: true,
        message: 'User profile has been updated.',
      });
    }
  });
});

router.post('/update_access_token', function (req, res) {
  const { email, accessToken } = req.body;
  try {
    User.findOne({ email: email }, (err, user) => {
      if (err) {
        res.status(400).send(err);
      } else if (!user) {
        res.status(401).json({ error: 'Cannot find user. Please try again.' });
      } else {
        user.access_token = accessToken;
        user.save(() => {
          console.log('User access token has been updated.');
        });
        res.status(201).json({
          success: true,
          message: 'User access token has been updated.',
        });
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'A database error has occured. Please try again',
    });
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

router.post('/add_new_device', async function (req, res) {
  if (!req.body.email || !req.body.deviceID) {
    res.status(401).json({ error: 'Missing email and/or device ID' });
    return;
  }
  const accessToken = req.body.accessToken;
  const deviceObj = {
    device_name: req.body.deviceName,
    device_id: req.body.deviceID,
  };

  const particleReqBody = {
    access_token: accessToken,
    args: '60,1350,10',
  };
  const particleReqConfig = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
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
          (async () => {
            try {
              const { data } = await axios.post(
                `https://api.particle.io/v1/devices/${req.body.deviceID}/settings`,
                particleReqBody,
                particleReqConfig
              );
              console.log(data);
              res.status(201).json({
                success: true,
                settings_sent: true,
                device_added: true,
                message:
                  'Device has been added and default settings have been sent to device.',
              });
            } catch (err) {
              res.status(200).json({
                success: true,
                settings_sent: false,
                device_added: true,
                message:
                  'Device has been added but default settings were not sent to device.',
              });
            }
          })();
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

router.post('/remove_device', function (req, res) {
  if (!req.body.email || !req.body.deviceID) {
    res.status(401).json({ error: 'Missing email and/or device ID' });
    return;
  }

  try {
    User.updateOne(
      {
        email: req.body.email,
      },
      { $pull: { devices: { device_id: req.body.deviceID } } },
      (error, success) => {
        if (error) {
          res.status(400).json({
            success: false,
            message: 'Cannot remove the device.',
          });
        } else {
          res
            .status(201)
            .json({ success: true, message: 'Device has been removed.' });
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

router.post('/update_measurement_settings', function (req, res) {
  const {
    email,
    deviceID,
    setting_name,
    frequency,
    start_time,
    end_time,
    accessToken,
  } = req.body;

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

  const particleReqBody = {
    access_token: accessToken,
    args: `${start_time.value},${end_time.value},${frequency.value}`,
  };
  const particleReqConfig = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  try {
    User.updateOne(
      {
        email: email,
        'devices.device_id': deviceID,
      },
      {
        $set: updatingObject,
      },
      (error, success) => {
        if (error) {
          res.status(400).json({
            success: false,
            message: 'Cannot update the measurement settings.',
          });
        } else {
          (async () => {
            try {
              const { data } = await axios.post(
                `https://api.particle.io/v1/devices/${deviceID}/settings`,
                particleReqBody,
                particleReqConfig
              );
              console.log(data);
              res.status(201).json({
                success: true,
                settings_sent: true,
                settings_updated: true,
                message:
                  'Measurement settings have been updated and the settings have been sent to device!',
              });
            } catch (err) {
              res.status(200).json({
                success: false,
                settings_sent: false,
                settings_updated: true,
                message:
                  'Measurement settings have been updated but the settings have not been sent to device!',
              });
            }
          })();
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
      User.aggregate(
        [
          {
            $unwind: '$devices',
          },
          {
            $match: {
              'devices.device_id': deviceID,
            },
          },
          {
            $unwind: '$devices.reports',
          },
          {
            $match: {
              'devices.reports.published_at': {
                $gte: new Date(new Date(date).setUTCHours(0, 0, 0, 0)),
                $lte: new Date(new Date(date).setUTCHours(23, 59, 59, 999)),
              },
            },
          },
          {
            $replaceRoot: {
              newRoot: {
                published_at: '$devices.reports.published_at',
                data: '$devices.reports.data',
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
              res.status(201).json({
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
    User.aggregate(
      [
        {
          $unwind: '$devices',
        },
        {
          $match: {
            'devices.device_id': deviceID,
          },
        },
        {
          $unwind: '$devices.reports',
        },
        {
          $match: {
            'devices.reports.published_at': {
              $gte: lowerBound,
              $lte: upperBound,
            },
          },
        },
        {
          $group: {
            _id: '$devices._id',
            max_heart_rate: { $max: '$devices.reports.data.heart_rate' },
            min_heart_rate: { $min: '$devices.reports.data.heart_rate' },
            avg_heart_rate: { $avg: '$devices.reports.data.heart_rate' },
            max_oxygen_level: { $max: '$devices.reports.data.oxygen_level' },
            min_oxygen_level: { $min: '$devices.reports.data.oxygen_level' },
            avg_oxygen_level: { $avg: '$devices.reports.data.oxygen_level' },
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
              message: 'The data for the requested week has been found.',
              data: reports,
            });
          } else {
            res.status(201).json({
              success: false,
              message: 'The data for the requested week was not found.',
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
});

router.post('/particle/report', async function (req, res) {
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
    User.findOneAndUpdate(
      { 'devices.device_id': deviceID },
      {
        $push: {
          'devices.$.reports': report,
        },
      },
      (err, doc) => {
        if (err) {
          res.status(401).json({ success: false, err: err });
        } else {
          const accessToken = doc.access_token;
          const ackBody = {
            access_token: accessToken,
            args: 'success',
          };
          const ackConfig = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          };
          axios
            .post(
              `https://api.particle.io/v1/devices/${deviceID}/database`,
              ackBody,
              ackConfig
            )
            .then((res) => {
              console.log(res.data);
              res.status(201).json({
                success: true,
                message:
                  'The new report has been saved and device has acknowledged!',
              });
            })
            .catch((err) => {
              res.status(201).json({
                success: true,
                message:
                  'The new report has been saved but device has not acknowledged!',
              });
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
