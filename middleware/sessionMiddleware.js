const Session = require('../models/sessionModel');
const Settings = require('../models/settingsModel');

module.exports = async function sessionMiddleware(req, res, next) {
  const sessionId = req.session.id;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const fingerprint = req.fingerprint.hash;

  try {
    const settings = await Settings.findOne();

    if (settings.blockedIPs.includes(ip)) {
      console.log(`Blocked IP attempt: ${ip}`);
      return res.redirect('/blocked.html');
    }

    let session;

    if (!settings.whitelistedIPs.includes(ip)) {
      session = await Session.findOne({
        $or: [
          { sessionId: sessionId },
          { fingerprint: fingerprint },
          { ipAddresses: ip }
        ]
      });

      const now = Date.now();
      const rateLimitWindowMs = settings.rateLimit.windowMs;
      const maxRequests = settings.rateLimit.maxRequests;

      if (session) {
        if (now - session.rateLimitResetTime > rateLimitWindowMs) {
          session.requestCount = 0;
          session.rateLimitResetTime = now;
        }

        session.requestCount++;
        session.lastRequestTime = now;

        if (session.requestCount > maxRequests) {
          console.log(`Rate limit exceeded for session: ${session.sessionId}`);
          return res.redirect('/blocked.html');
        }

        if (session.anomalyScore > settings.anomalyScoreThreshold) {
          console.log(`Anomaly score exceeded for session: ${session.sessionId}`);
          return res.redirect('/anomaly_detected.html');
        }

        if (!session.ipAddresses.includes(ip)) {
          session.ipAddresses.push(ip);
        }

        session.fingerprint = fingerprint;
        await session.save();
        console.log('Session updated:', session.sessionId);

      } else {
        session = new Session({
          sessionId: sessionId,
          ipAddresses: [ip],
          fingerprint: fingerprint,
          userAgent: req.headers['user-agent'],
          rateLimitResetTime: now,
          requestCount: 1 
        });
        await session.save();
        console.log('New session created:', session.sessionId);
      }
    } else {
      session = await Session.findOne({
        $or: [
          { sessionId: sessionId },
          { fingerprint: fingerprint },
          { ipAddresses: ip }
        ]
      });

      if (session && session.isBlocked) {
        console.log(`Blocked session attempt: ${session.sessionId}`);
        return res.redirect('/blocked.html');
      }

      if (session) {
        if (!session.ipAddresses.includes(ip)) {
          session.ipAddresses.push(ip);
        }
        session.sessionId = sessionId;
        session.fingerprint = fingerprint;
        await session.save();
        console.log('Reusing existing session:', session.sessionId);
      }
    }

    req.sessionData = session;
    next();
  } catch (error) {
    console.error('Error handling session data:', error);
    res.status(500).send('Internal Server Error');
  }
};
