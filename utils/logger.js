const { createLogger, format, transports } = require('winston');
const path = require('path');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.File({ filename: path.join(__dirname, '../logs/waf-proxy.log') }),
        new transports.Console({ format: format.simple() }) 
    ]
});

module.exports = logger;
