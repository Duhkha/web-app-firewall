require('dotenv').config(); 

module.exports = {
  PORT: process.env.PORT || 3001,
  MONGO_URI: 'mongodb://127.0.0.1:27017/waf',
  TARGET_URL: 'http://192.168.1.14:8080',
  SESSION_SECRET: process.env.SESSION_SECRET, 
  API_SECRET: process.env.API_SECRET,
  adminUsername: 'admin', 
  adminPassword: 'admin123', 
};
