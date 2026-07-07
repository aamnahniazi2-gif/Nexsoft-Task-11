const fs = require('fs');
const path = require('path');

const logDirectory = path.join(__dirname, '../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

const logger = {
    info: (message, data = {}) => {
        const log = {
            level: 'INFO',
            timestamp: new Date().toISOString(),
            message,
            data
        };
        console.log(JSON.stringify(log));
        writeToFile('info.log', log);
    },
    
    error: (message, error = {}) => {
        const log = {
            level: 'ERROR',
            timestamp: new Date().toISOString(),
            message,
            error: {
                message: error.message,
                stack: error.stack
            }
        };
        console.error(JSON.stringify(log));
        writeToFile('error.log', log);
    },
    
    warn: (message, data = {}) => {
        const log = {
            level: 'WARN',
            timestamp: new Date().toISOString(),
            message,
            data
        };
        console.warn(JSON.stringify(log));
        writeToFile('warn.log', log);
    },
    
    debug: (message, data = {}) => {
        if (process.env.NODE_ENV === 'development') {
            const log = {
                level: 'DEBUG',
                timestamp: new Date().toISOString(),
                message,
                data
            };
            console.debug(JSON.stringify(log));
        }
    }
};

const writeToFile = (filename, log) => {
    const logFile = path.join(logDirectory, filename);
    fs.appendFile(logFile, JSON.stringify(log) + '\n', (err) => {
        if (err) console.error('Error writing to log file:', err);
    });
};

module.exports = logger;