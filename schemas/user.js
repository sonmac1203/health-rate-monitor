const db = require('../db');

const userSchema = new db.Schema({
  email: String,
  passwordHash: String,
  lastAccess: { type: Date, default: Date.now },
});

const User = db.model('Users', userSchema);

module.exports = User;
