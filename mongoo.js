// helper script to populate the database with an admin user

const mongoose = require('mongoose');
const User = require('./models/userModel'); // Adjust the path to your user model

async function createAdminUser() {
  await mongoose.connect('mongodb://127.0.0.1:27017/waf', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const username = "admin"; // Customize as needed
  const password = "admin123"; // Customize as needed

  // Check if the user already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    console.log('User already exists.');
  } else {
    const user = new User({
      username,
      password // This will be hashed automatically by the pre-save hook in the model
    });
  
    await user.save();
  
    console.log('Admin user created successfully.');
  }

  mongoose.disconnect();
}

createAdminUser().catch(console.error);
