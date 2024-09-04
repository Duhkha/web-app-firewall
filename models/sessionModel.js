const mongoose = require('mongoose');
const { Schema } = mongoose;

const sessionSchema = new Schema({
  sessionId: { type: String, required: true, unique: true }, 
  ipAddresses: [{ type: String }], 
  fingerprint: { type: String, required: true }, 
  userAgent: String, 
  creationDate: { type: Date, default: Date.now }, 
  anomalyScore: { type: Number, default: 0 }, 
  requestCount: { type: Number, default: 0 }, 
  requests: [{ type: Schema.Types.ObjectId, ref: 'Request' }], 
  isBlocked: { type: Boolean, default: false },
  lastRequestTime: { type: Date, default: Date.now }, 
  rateLimitResetTime: { type: Date, default: Date.now } 
}, { timestamps: true });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
