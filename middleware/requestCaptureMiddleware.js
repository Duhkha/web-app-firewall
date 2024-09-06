module.exports = function requestCaptureMiddleware(req, res, next) {
    const chunks = [];

    const parseCookies = (cookieHeader) => {
        const cookies = {};
        if (cookieHeader) {
            cookieHeader.split(';').forEach(cookie => {
                const [name, value] = cookie.split('=').map(part => part.trim());
                cookies[name] = value;
            });
        }
        return cookies;
    };

    const cleanIpAddress = (ipAddress) => {
        return ipAddress.includes('::ffff:') ? ipAddress.split('::ffff:')[1] : ipAddress;
    };

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

        const cookies = parseCookies(req.headers.cookie);

        req.capturedRequest = {
            method: req.method, 
            uriPath: req.originalUrl.split('?')[0], 
            queryString: req.originalUrl.split('?')[1] || '', 
            queryParams: req.query, 
            headers: req.headers, 
            cookies, 
            ipAddress: cleanIpAddress(req.headers['x-forwarded-for'] || req.connection.remoteAddress), 
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
