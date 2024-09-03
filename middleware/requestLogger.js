const Request = require('../models/requestModel');
const Session = require('../models/sessionModel');

module.exports = function requestLogger(req, res, next) {
    const originalEnd = res.end;
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
    });

  
    res.end = function (chunk, encoding) {
        res.end = originalEnd;
        res.end(chunk, encoding);

        const sessionData = req.sessionData;

       
        setTimeout(async () => {
            try {
                const newRequest = await Request.create({
                    sessionId: sessionData._id,
                    ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                    method: req.method,
                    urlPath: req.originalUrl,
                    queryParams: req.query,
                    headers: req.headers,
                    requestBody: req.body,
                    responseStatus: res.statusCode,
                    responseHeaders: res.getHeaders()
                });

                await Session.findByIdAndUpdate(sessionData._id, {
                    $push: { requests: newRequest._id },
                    $inc: { requestCount: 1 }
                });
            } catch (error) {
                console.error('Error logging request:', error);
            }
        }, 0);
    };

    next();
};