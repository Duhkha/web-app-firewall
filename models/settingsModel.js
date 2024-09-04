const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  blockedCountries: {
    type: [String],
    default: []
  },
  rateLimit: {
    windowMs: { type: Number, default: 900000 }, // Default: 15 minutes
    maxRequests: { type: Number, default: 100 } // Default: 100 requests per windowMs
  },
  anomalyScoreThreshold: {
    type: Number,
    default: 70 
  },
  blockedIPs: {
    type: [String],
    default: []
  },
  whitelistedIPs: {
    type: [String],
    default: []
  }
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;