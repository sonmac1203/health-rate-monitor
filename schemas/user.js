const db = require('../db');

const userSchema = new db.Schema({
  email: String,
  passwordHash: String,
  lastAccess: { type: Date, default: Date.now },
  devices_added: { type: Number, default: 0 },
  devices: {
    type: [
      {
        device_id: String,
        device_name: String,
        time_added: { type: Date, default: Date.now },
        measurement_settings: {
          frequency: { type: Number, default: 30 },
          start_time: { type: Number, default: 21600 }, // 6:00 AM
          end_time: { type: Number, default: 79200 }, // 10:00 PM
        },
      },
    ],
    default: [],
  },
  recent_settings: {
    type: [
      {
        setting_name: String,
        frequency: Number,
        start_time: Number,
        end_time: Number,
      },
    ],
    default: [],
  },
});

const User = db.model('Users', userSchema);

module.exports = User;
