const mongoose = require('mongoose');
const { Schema } = mongoose;

const requestSchema = new Schema({
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true }, 
  ipAddress: { type: String, required: true }, 
  method: { type: String, required: true }, 
  urlPath: { type: String, required: true }, 
  queryString: { type: String }, 
  queryParams: { type: Map, of: String }, 
  headers: { type: Map, of: String },
  cookies: { type: Map, of: String }, 
  requestBody: { type: Schema.Types.Mixed }, 
  responseStatus: { type: Number }, 
  responseBody: { type: Schema.Types.Mixed }, 
  responseHeaders: { type: Schema.Types.Mixed }, 
  timestamp: { type: Date, default: Date.now } 
}, { timestamps: true });

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;
