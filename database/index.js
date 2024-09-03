const mongoose = require('mongoose');
const { MONGO_URI } = require('../config/config');

const connect = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB!');
  } catch (err) {
    console.error('Could not connect to MongoDB.', err);
  }
};

module.exports = { connect };
