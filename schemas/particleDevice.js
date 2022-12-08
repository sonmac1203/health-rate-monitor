const db = require('../db');

const particleDevice = new db.Schema({
  device_id: String,
  reports: [
    {
      stored_at: { type: Date, default: Date.now },
      published_at: Date,
      data: {
        heart_rate: Number,
        oxygen_level: Number,
      },
    },
  ],
});

const ParticleDevice = db.model('ParticleDevice', particleDevice);

module.exports = ParticleDevice;
