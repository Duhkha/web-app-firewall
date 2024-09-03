const { adminUsername, adminPassword } = require('../config/config');

module.exports = (req, res, next) => {
  if (req.session.isAuthenticated && req.session.userRole === 'admin') {
    next(); 
  } else {
    res.redirect('/admin/login'); 
  }
};
