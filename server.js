const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser')

const { PORT, SESSION_SECRET } = require('./config/config');
const { connect } = require('./database'); 

const sessionMiddleware = require('./middleware/sessionMiddleware');
const requestFilterMiddleware = require('./middleware/requestFilterMiddleware'); 
const requestLogger = require('./middleware/requestLogger');
const proxyMiddleware = require('./middleware/proxyMiddleware');
const logger = require('./utils/logger');
const adminRoutes = require('./routes/adminRoutes'); 
const wafMiddleware = require('./middleware/wafMiddleware');
const requestCaptureMiddleware = require('./middleware/requestCaptureMiddleware'); 

const app = express();

app.use(express.static('public'));


connect();


logger.info('Server is starting...');


app.use(session({
  secret: SESSION_SECRET,
  resave: false, 
  saveUninitialized: false, 
  cookie: {
      secure: false, 
      httpOnly: true, 
      sameSite: 'Lax', 
      maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

//pipeline

app.use(sessionMiddleware);

app.use(requestFilterMiddleware);

app.use(requestCaptureMiddleware);

//app.use(wafMiddleware);

//app.use(requestLogger);


app.use((req, res, next) => {
  if (!req.skipMiddlewares) {
      wafMiddleware(req, res, next);
  } else {
      next();
  }
});
/*
*/


app.use((req, res, next) => {
  if (!req.skipMiddlewares) {
      requestLogger(req, res, next);
  } else {
      next();
  }
});






//app.use(adminRoutes);

app.use(proxyMiddleware);


app.listen(PORT, () => {
    console.log(`Reverse Proxy running on http://localhost:${PORT}`);
});
