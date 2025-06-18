const winston = require('winston');
const config = require('../config');

// Custom format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'trustflow-agent' },
  transports: [
    // Console logging
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        })
      )
    }),
    
    // File logging for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // File logging for all levels
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Helper methods for specific log types
logger.agent = {
  startup: (message, meta = {}) => logger.info(`[STARTUP] ${message}`, meta),
  monitoring: (message, meta = {}) => logger.info(`[MONITORING] ${message}`, meta),
  settlement: (message, meta = {}) => logger.info(`[SETTLEMENT] ${message}`, meta),
  condition: (message, meta = {}) => logger.info(`[CONDITION] ${message}`, meta),
  blockchain: (message, meta = {}) => logger.info(`[BLOCKCHAIN] ${message}`, meta),
  firebase: (message, meta = {}) => logger.info(`[FIREBASE] ${message}`, meta),
  error: (message, meta = {}) => logger.error(`[ERROR] ${message}`, meta)
};

module.exports = logger; 