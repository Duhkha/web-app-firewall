const express = require('express');
const router = express.Router();
const { adminUsername, adminPassword } = require('../config/config');
const Rule = require('../models/ruleModel');
const adminAuth = require('../middleware/adminAuth'); 


router.get('/admin/login', (req, res) => {
  res.send(`
    <h1>Admin Login</h1>
    <form action="/admin/login" method="POST">
      <label for="username">Username:</label>
      <input type="text" id="username" name="username" required><br>
      
      <label for="password">Password:</label>
      <input type="password" id="password" name="password" required><br>
      
      <button type="submit">Login</button>
    </form>
  `);
});


router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  
  if (username === adminUsername && password === adminPassword) {
    req.session.isAuthenticated = true;
    req.session.userRole = 'admin';
    res.redirect('/admin');
  } else {
    res.status(401).send('Invalid credentials');
  }
});


router.get('/admin/logout', adminAuth, (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});


router.get('/admin', adminAuth, (req, res) => {
  res.send(`
    <h1>Admin Page</h1>
    <p>Welcome, Admin!</p>
    <a href="/admin/logout">Logout</a>
    <form action="/admin/rules" method="POST">
      <label for="name">Rule Name:</label>
      <input type="text" id="name" name="name" required><br>
      
      <label for="description">Description:</label>
      <textarea id="description" name="description"></textarea><br>
      
      <label for="conditions">Conditions (JSON format):</label>
      <textarea id="conditions" name="conditions" required></textarea><br>
      
      <label for="action">Action:</label>
      <select id="action" name="action">
        <option value="block">Block</option>
        <option value="allow">Allow</option>
        <option value="monitor">Monitor</option>
      </select><br>
      
      <button type="submit">Create Rule</button>
    </form>
  `);
});


router.post('/admin/rules', adminAuth, async (req, res) => {
  try {
    const { name, description, conditions, action } = req.body;
    const newRule = new Rule({
      name,
      description,
      conditions: JSON.parse(conditions),
      action
    });
    await newRule.save();
    res.send('Rule created successfully!');
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
