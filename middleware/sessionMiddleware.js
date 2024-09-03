//it may need more refinement. since users get cookie from us
//that messes up a little bit

const Session = require('../models/sessionModel');
const Fingerprint = require('express-fingerprint');

module.exports = [
  Fingerprint(),
  async (req, res, next) => {
    const sessionId = req.session.id;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const fingerprint = req.fingerprint.hash;

    try {
      let session = await Session.findOne({
        $or: [
          { sessionId: sessionId },
          { fingerprint: fingerprint },
          { ipAddresses: ip }
        ]
      });

      if (!session) {
        session = new Session({
          sessionId: sessionId,
          ipAddresses: [ip],
          fingerprint: fingerprint,
          userAgent: req.headers['user-agent']
        });
        await session.save();
        console.log('New session created:', session.sessionId);
      } else {
        if (session.isBlocked) {
          console.log(`Blocked session attempt: ${session.sessionId}`);
          return res.redirect('/blocked.html'); 
        }

        if (!session.ipAddresses.includes(ip)) {
          session.ipAddresses.push(ip);
        }

        session.sessionId = sessionId;
        session.fingerprint = fingerprint;
        
        await session.save();
        console.log('Reusing existing session:', session.sessionId);
      }

      req.sessionData = session;
      next();
    } catch (error) {
      console.error('Error handling session data:', error);
      res.status(500).send('Internal Server Error');
    }
  }
];
