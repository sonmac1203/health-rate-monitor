const db = require('../db');

const userSchema = new db.Schema({
  email: String,
  passwordHash: String,
  lastAccess: { type: Date, default: Date.now },
  devices: {
    type: [
      {
        device_id: String,
        time_added: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
});

const User = db.model('Users', userSchema);

module.exports = User;
