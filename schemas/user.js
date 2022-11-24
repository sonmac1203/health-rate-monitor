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
      },
    ],
    default: [],
  },
});

const User = db.model('Users', userSchema);

module.exports = User;
