const db = require('../db');

const userSchema = new db.Schema({
  name: String,
  email: String,
  passwordHash: String,
  lastAccess: { type: Date, default: Date.now },
  devices_added: { type: Number, default: 0 },
  access_token: { type: String, default: '' },
  devices: {
    type: [
      {
        device_id: String,
        device_name: String,
        time_added: { type: Date, default: Date.now },
        measurement_settings: {
          frequency: { type: Number, default: 30 },
          start_time: { type: Number, default: 360 }, // 6:00 AM to minutes
          end_time: { type: Number, default: 1320 }, // 10:00 PM
        },
        reports: {
          type: [
            {
              stored_at: { type: Date, default: Date.now },
              published_at: Date,
              data: {
                heart_rate: Number,
                oxygen_level: Number,
              },
            },
          ],
          default: [],
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
