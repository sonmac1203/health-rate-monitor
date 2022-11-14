const db = require('../db');

const userSchema = new db.Schema({
  email: String,
  passwordHash: String,
});

const User = db.model('Users', userSchema);

module.exports = User;
