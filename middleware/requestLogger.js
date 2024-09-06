const Request = require('../models/requestModel');
const Session = require('../models/sessionModel');

module.exports = function requestLogger(req, res, next) {
    const originalEnd = res.end;

    res.end = function (chunk, encoding) {
        res.end = originalEnd;
        res.end(chunk, encoding);

        const sessionData = req.sessionData;

        setTimeout(async () => {
            try {
                const newRequest = await Request.create({
                    sessionId: sessionData._id,
                    ipAddress: req.capturedRequest.ipAddress, 
                    method: req.capturedRequest.method, 
                    urlPath: req.capturedRequest.uriPath, 
                    queryString: req.capturedRequest.queryString, 
                    queryParams: req.capturedRequest.queryParams, 
                    headers: req.capturedRequest.headers, 
                    cookies: req.capturedRequest.cookies, 
                    requestBody: req.capturedRequest.requestBody, 
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
