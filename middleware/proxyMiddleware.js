const http = require('http');
const logger = require('../utils/logger');  
const { TARGET_URL, API_SECRET } = require('../config/config');

module.exports = function proxyMiddleware(req, res) {
    const targetUrl = new URL(TARGET_URL);

    const options = {
        hostname: targetUrl.hostname,
        port: targetUrl.port,
        path: req.originalUrl,
        method: req.method,
        headers: {
            ...req.headers,
            'X-Auth-Token': API_SECRET,
            'X-Forwarded-For': req.headers['x-forwarded-for'] || req.socket.remoteAddress
        }
    };

    const proxyReq = http.request(options, (proxyRes) => {
        logger.info(`Proxying request: ${req.method} ${req.originalUrl} to ${targetUrl.hostname}`); 

        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        logger.error(`Proxy Request Error: ${err.message}`);  
        res.status(500).send('Proxy Error');
    });

    req.pipe(proxyReq);
};
