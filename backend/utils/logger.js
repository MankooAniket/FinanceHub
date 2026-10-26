const winston = require('winston');
const path = require('path');

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...rest } = info;
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(rest).length > 0) {
      log += ` ${JSON.stringify(rest, null, 2)}`;
    }
    
    return log;
  })
);

const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.printf((info) => {
        const { timestamp, level, message, ...rest } = info;
        let log = `${timestamp} [${level}]: ${message}`;
        
        if (Object.keys(rest).length > 0 && rest.stack) {
          log += `\n${rest.stack}`;
        } else if (Object.keys(rest).length > 0) {
          log += ` ${JSON.stringify(rest)}`;
        }
        
        return log;
      })
    ),
  }),
  
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/error.log'),
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/combined.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false,
});

const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

logger.logError = (error, context = {}) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

logger.logRequest = (req, additionalInfo = {}) => {
  logger.http({
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
    ...additionalInfo,
  });
};

logger.logDatabaseQuery = (query, duration) => {
  logger.debug({
    type: 'database',
    query: query.toString(),
    duration: `${duration}ms`,
  });
};

logger.logApiCall = (service, endpoint, duration, success) => {
  logger.info({
    type: 'api_call',
    service,
    endpoint,
    duration: `${duration}ms`,
    success,
  });
};

process.on('unhandledRejection', (reason, promise) => {
  logger.error({
    message: 'Unhandled Rejection',
    reason: reason,
    promise: promise,
  });
});

process.on('uncaughtException', (error) => {
  logger.error({
    message: 'Uncaught Exception',
    error: error.message,
    stack: error.stack,
  });
  
  process.exit(1);
});

module.exports = logger;

