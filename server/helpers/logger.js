// server/utils/logger.js

import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, service, ...metadata }) => {
        let metaStr = '';
        if (Object.keys(metadata).length > 0 && metadata.stack) {
            metaStr = `\n${metadata.stack}`;
        } else if (Object.keys(metadata).length > 0) {
            metaStr = `\n${JSON.stringify(metadata, null, 2)}`;
        }
        return `${timestamp} [${service || 'server'}] ${level}: ${message}${metaStr}`;
    })
);

// Create the logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    defaultMeta: { service: 'chat-app' },
    format: logFormat,
    transports: [
        // Write logs with level 'error' and below to error.log
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write all logs to combined.log
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, 'exceptions.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, 'rejections.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    ]
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat,
        handleExceptions: true,
    }));
}

// Create a stream object for Morgan HTTP request logging
logger.stream = {
    write: function (message) {
        logger.info(message.trim());
    }
};

// Add custom log methods for specific components
const createComponentLogger = (componentName) => {
    return {
        error: (message, metadata = {}) => logger.error(message, { component: componentName, ...metadata }),
        warn: (message, metadata = {}) => logger.warn(message, { component: componentName, ...metadata }),
        info: (message, metadata = {}) => logger.info(message, { component: componentName, ...metadata }),
        http: (message, metadata = {}) => logger.http(message, { component: componentName, ...metadata }),
        debug: (message, metadata = {}) => logger.debug(message, { component: componentName, ...metadata }),
    };
};

// Export component loggers
logger.notification = createComponentLogger('notification');
logger.auth = createComponentLogger('auth');
logger.chat = createComponentLogger('chat');
logger.call = createComponentLogger('call');
logger.socket = createComponentLogger('socket');

// Method to log API requests (for use with Express middleware)
logger.logApiRequest = (req, res, next) => {
    const start = Date.now();

    // Log request details
    logger.http(`API Request: ${req.method} ${req.originalUrl}`, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?.id || 'unauthenticated',
        userAgent: req.headers['user-agent'],
    });

    // Log response details
    res.on('finish', () => {
        const duration = Date.now() - start;
        const level = res.statusCode >= 400 ? 'warn' : 'http';

        logger[level](`API Response: ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration,
            userId: req.user?.id || 'unauthenticated',
        });
    });

    next();
};

// Socket.io connection logger middleware
logger.socketMiddleware = (socket, next) => {
    logger.socket.info(`Socket connected: ${socket.id}`, {
        socketId: socket.id,
        userId: socket.user?.id || 'unauthenticated',
        transport: socket.conn.transport.name,
        ip: socket.handshake.address
    });

    socket.on('disconnect', (reason) => {
        logger.socket.info(`Socket disconnected: ${socket.id} - ${reason}`, {
            socketId: socket.id,
            userId: socket.user?.id || 'unauthenticated',
            reason
        });
    });

    next();
};

export default logger;