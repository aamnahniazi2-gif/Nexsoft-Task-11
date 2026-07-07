const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log request
    logger.info('Incoming Request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    
    // Capture response
    const originalSend = res.send;
    res.send = function(data) {
        const duration = Date.now() - start;
        
        logger.info('Outgoing Response', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`
        });
        
        originalSend.call(this, data);
    };
    
    next();
};

module.exports = requestLogger;