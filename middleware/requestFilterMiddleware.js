//shouldn't be done, but for dev purposes

const path = require('path');
const staticExtensions = ['.js', '.css', '.png', '.jpg', '.woff2', '.ico', '.jpeg'];
const ignoredPaths = ['/socket.io/', '/assets/', '/api/Quantitys/'];

const requestFilterMiddleware = (req, res, next) => {
    const ext = path.extname(req.path);

    /*
    if (staticExtensions.includes(ext) || ignoredPaths.some(ignoredPath => req.url.startsWith(ignoredPath))) {
        req.skipMiddlewares = true;  
    }
*/

//for dev purposes
if (req.method != 'POST') {
    req.skipMiddlewares = true; 
}

if (ignoredPaths.some(ignoredPath => req.url.startsWith(ignoredPath))) {
    req.skipMiddlewares = true; 
}



    next();
};

module.exports = requestFilterMiddleware;