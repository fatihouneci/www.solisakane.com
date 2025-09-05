/**
 * @file logger.js
 * @description
 * EN: This file configures a comprehensive logging system for the server application using Winston.
 * It includes console logging, file logging for errors and combined logs, and custom log formats.
 * It also provides specialized loggers for different application components and middleware for API request and Socket.IO logging.
 * FR: Ce fichier configure un système de journalisation complet pour l'application serveur à l'aide de Winston.
 * Il inclut la journalisation sur console, la journalisation sur fichiers pour les erreurs et les journaux combinés, ainsi que des formats de journal personnalisés.
 * Il fournit également des loggers spécialisés pour différents composants de l'application et des middlewares pour la journalisation des requêtes API et de Socket.IO.
 */

import winston from 'winston'; // EN: Winston logging library / FR: Bibliothèque de journalisation Winston
import path from 'path'; // EN: Node.js Path module / FR: Module de chemin de Node.js
import fs from 'fs'; // EN: Node.js File System module / FR: Module du système de fichiers de Node.js

// EN: Create logs directory if it doesn't exist
// FR: Créer le répertoire des journaux s'il n'existe pas
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// EN: Define log format for file transports (JSON format with timestamp and error stack)
// FR: Définir le format de journal pour les transports de fichiers (format JSON avec horodatage et pile d'erreurs)
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }), // EN: Include stack trace for errors / FR: Inclure la trace de la pile pour les erreurs
    winston.format.splat(), // EN: Enable string interpolation / FR: Activer l'interpolation de chaînes
    winston.format.json() // EN: Output logs as JSON / FR: Sortie des journaux au format JSON
);

// EN: Console format for development (colored, human-readable)
// FR: Format console pour le développement (coloré, lisible par l'homme)
const consoleFormat = winston.format.combine(
    winston.format.colorize(), // EN: Add colors to log levels / FR: Ajouter des couleurs aux niveaux de journalisation
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // EN: Add timestamp / FR: Ajouter un horodatage
    winston.format.printf(({ timestamp, level, message, service, ...metadata }) => {
        let metaStr = '';
        // EN: Format metadata for display / FR: Formater les métadonnées pour l'affichage
        if (Object.keys(metadata).length > 0 && metadata.stack) {
            metaStr = `\n${metadata.stack}`;
        } else if (Object.keys(metadata).length > 0) {
            metaStr = `\n${JSON.stringify(metadata, null, 2)}`;
        }
        return `${timestamp} [${service || 'server'}] ${level}: ${message}${metaStr}`;
    })
);

// EN: Create the main logger instance
// FR: Création de l'instance de logger principale
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info', // EN: Log level from environment variable or default to 'info' / FR: Niveau de journalisation depuis la variable d'environnement ou 'info' par défaut
    defaultMeta: { service: 'chat-app' }, // EN: Default metadata for all logs / FR: Métadonnées par défaut pour tous les journaux
    format: logFormat, // EN: Use the defined file log format / FR: Utiliser le format de journal de fichier défini
    transports: [
        // EN: Write logs with level 'error' and below to error.log
        // FR: Écrire les journaux de niveau 'error' et inférieur dans error.log
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // EN: Write all logs to combined.log
        // FR: Écrire tous les journaux dans combined.log
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
    // EN: Handlers for uncaught exceptions
    // FR: Gestionnaires pour les exceptions non capturées
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, 'exceptions.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    ],
    // EN: Handlers for unhandled promise rejections
    // FR: Gestionnaires pour les rejets de promesses non gérés
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, 'rejections.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    ]
});

// EN: Add console transport for non-production environments
// FR: Ajouter le transport console pour les environnements non-production
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat,
        handleExceptions: true, // EN: Allow console to handle exceptions / FR: Autoriser la console à gérer les exceptions
    }));
}

// EN: Create a stream object for Morgan HTTP request logging (if Morgan is used)
// FR: Créer un objet de flux pour la journalisation des requêtes HTTP de Morgan (si Morgan est utilisé)
logger.stream = {
    write: function (message) {
        logger.info(message.trim());
    }
};

/**
 * EN: Creates a component-specific logger.
 * FR: Crée un logger spécifique à un composant.
 * @param {string} componentName - The name of the component. / Le nom du composant.
 * @returns {object} An object with logging methods (error, warn, info, etc.) for the component. / Un objet avec des méthodes de journalisation (error, warn, info, etc.) pour le composant.
 */
const createComponentLogger = (componentName) => {
    return {
        error: (message, metadata = {}) => logger.error(message, { component: componentName, ...metadata }),
        warn: (message, metadata = {}) => logger.warn(message, { component: componentName, ...metadata }),
        info: (message, metadata = {}) => logger.info(message, { component: componentName, ...metadata }),
        http: (message, metadata = {}) => logger.http(message, { component: componentName, ...metadata }),
        debug: (message, metadata = {}) => logger.debug(message, { component: componentName, ...metadata }),
    };
};

// EN: Export component-specific loggers for various parts of the application
// FR: Exporter les loggers spécifiques aux composants pour diverses parties de l'application
logger.notification = createComponentLogger('notification');
logger.auth = createComponentLogger('auth');
logger.chat = createComponentLogger('chat');
logger.call = createComponentLogger('call');
logger.socket = createComponentLogger('socket');

/**
 * EN: Middleware to log API requests.
 * FR: Middleware pour journaliser les requêtes API.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
logger.logApiRequest = (req, res, next) => {
    const start = Date.now();

    // EN: Log request details
    // FR: Journaliser les détails de la requête
    logger.http(`API Request: ${req.method} ${req.originalUrl}`, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?.id || 'unauthenticated',
        userAgent: req.headers['user-agent'],
    });

    // EN: Log response details when the response finishes
    // FR: Journaliser les détails de la réponse lorsque la réponse est terminée
    res.on('finish', () => {
        const duration = Date.now() - start;
        const level = res.statusCode >= 400 ? 'warn' : 'http'; // EN: Use 'warn' for error responses / FR: Utiliser 'warn' pour les réponses d'erreur

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

/**
 * EN: Socket.io connection logger middleware.
 * FR: Middleware de journalisation des connexions Socket.io.
 * @param {object} socket - The Socket.IO socket object. / L'objet socket Socket.IO.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
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
