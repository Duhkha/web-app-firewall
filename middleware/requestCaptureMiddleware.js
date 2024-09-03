//not used for now, since i think it was messing it up a bit

module.exports = function requestCaptureMiddleware(req, res, next) {
  try {
      req.capturedRequest = {
          method: req.method,
          urlPath: req.originalUrl,
          queryParams: req.query,
          headers: req.headers,
          ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          requestBody: req.body 
      };

      next(); 
  } catch (error) {
      console.error('Error in requestCaptureMiddleware:', error);
      res.status(500).send('Internal server error');
  }
};
