module.exports = function requestCaptureMiddleware(req, res, next) {
    const chunks = [];

    req.on('data', chunk => {
        chunks.push(chunk);
    });

    req.on('end', () => {
        const bodyBuffer = Buffer.concat(chunks);
        req.rawBody = bodyBuffer;

        try {
            req.body = JSON.parse(bodyBuffer.toString());
        } catch (e) {
            req.body = bodyBuffer.toString();
        }

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
    });

    req.on('error', (error) => {
        console.error('Error in requestCaptureMiddleware:', error);
        res.status(500).send('Internal server error');
    });
};
