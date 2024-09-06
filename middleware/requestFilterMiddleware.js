const path = require('path');

const ignoredPaths = ['/socket.io/', '/assets/', '/api/Quantitys/']; // Add any other paths as needed

const requestFilterMiddleware = (req, res, next) => {
    const ext = path.extname(req.path);

    if (ignoredPaths.some(ignoredPath => req.url.startsWith(ignoredPath))) {
        req.skipMiddlewares = true;  
    }

    /*
    if (req.method !== 'POST') {
        req.skipMiddlewares = true; 
    }
    */

    next(); 
};

module.exports = requestFilterMiddleware;
