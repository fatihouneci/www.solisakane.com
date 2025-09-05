/**
 * @file security.config.js
 * @description
 * EN: This file contains security configuration settings and environment variable validation.
 * FR: Ce fichier contient les paramètres de configuration de sécurité et la validation des variables d'environnement.
 */
import crypto from 'crypto';
import { generateSecureJWTSecret } from '../security/securityAudit.js';

/**
 * EN: Validate required environment variables
 * FR: Valider les variables d'environnement requises
 */
const validateEnvironmentVariables = () => {
  const requiredVars = [
    'JWT_SECRET',
    'MONGODB_URL',
    'NODE_ENV'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
    
    // EN: Generate secure defaults for missing variables / FR: Générer des valeurs par défaut sécurisées pour les variables manquantes
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = generateSecureJWTSecret();
      console.warn('🔐 Generated secure JWT secret (please set JWT_SECRET in production)');
    }
  }
};

/**
 * EN: Security configuration object
 * FR: Objet de configuration de sécurité
 */
const securityConfig = {
  // EN: JWT Configuration / FR: Configuration JWT
  jwt: {
    secret: process.env.JWT_SECRET || generateSecureJWTSecret(),
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'solisakane',
    audience: process.env.JWT_AUDIENCE || 'solisakane-users',
    algorithm: 'HS256'
  },

  // EN: Password Configuration / FR: Configuration des mots de passe
  password: {
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
    maxLength: parseInt(process.env.PASSWORD_MAX_LENGTH) || 128,
    requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
    requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
    requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
    requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL !== 'false',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    maxAge: parseInt(process.env.PASSWORD_MAX_AGE) || 90 // EN: Days / FR: Jours
  },

  // EN: Account Lockout Configuration / FR: Configuration de verrouillage de compte
  lockout: {
    maxAttempts: parseInt(process.env.LOCKOUT_MAX_ATTEMPTS) || 5,
    lockTime: parseInt(process.env.LOCKOUT_TIME) || 2 * 60 * 60 * 1000, // EN: 2 hours in ms / FR: 2 heures en ms
    resetTime: parseInt(process.env.LOCKOUT_RESET_TIME) || 60 * 60 * 1000 // EN: 1 hour in ms / FR: 1 heure en ms
  },

  // EN: Rate Limiting Configuration / FR: Configuration de limitation de taux
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // EN: 15 minutes / FR: 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX) || 1000,
    authWindowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // EN: 15 minutes / FR: 15 minutes
    authMaxAttempts: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5
  },

  // EN: Session Configuration / FR: Configuration de session
  session: {
    secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
    name: process.env.SESSION_NAME || 'solisakane.sid',
    resave: process.env.SESSION_RESAVE === 'true',
    saveUninitialized: process.env.SESSION_SAVE_UNINITIALIZED === 'true',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000, // EN: 24 hours / FR: 24 heures
      sameSite: process.env.SESSION_SAME_SITE || 'strict'
    }
  },

  // EN: CORS Configuration / FR: Configuration CORS
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With']
  },

  // EN: Security Headers Configuration / FR: Configuration des en-têtes de sécurité
  headers: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    hsts: {
      maxAge: parseInt(process.env.HSTS_MAX_AGE) || 31536000, // EN: 1 year / FR: 1 an
      includeSubDomains: process.env.HSTS_INCLUDE_SUBDOMAINS !== 'false',
      preload: process.env.HSTS_PRELOAD !== 'false'
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: 'strict-origin-when-cross-origin'
  },

  // EN: Database Security Configuration / FR: Configuration de sécurité de base de données
  database: {
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 30000,
    socketTimeout: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
    minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 1,
    maxIdleTimeMS: parseInt(process.env.DB_MAX_IDLE_TIME) || 30000,
    serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT) || 5000
  },

  // EN: File Upload Security Configuration / FR: Configuration de sécurité de téléchargement de fichiers
  fileUpload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // EN: 10MB / FR: 10MB
    allowedMimeTypes: process.env.ALLOWED_MIME_TYPES ? 
      process.env.ALLOWED_MIME_TYPES.split(',') : 
      ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'],
    allowedExtensions: process.env.ALLOWED_EXTENSIONS ? 
      process.env.ALLOWED_EXTENSIONS.split(',') : 
      ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt'],
    scanForViruses: process.env.SCAN_FOR_VIRUSES === 'true',
    quarantinePath: process.env.QUARANTINE_PATH || './uploads/quarantine'
  },

  // EN: Email Security Configuration / FR: Configuration de sécurité email
  email: {
    rateLimit: {
      windowMs: parseInt(process.env.EMAIL_RATE_LIMIT_WINDOW) || 60 * 60 * 1000, // EN: 1 hour / FR: 1 heure
      maxEmails: parseInt(process.env.EMAIL_RATE_LIMIT_MAX) || 10
    },
    verification: {
      tokenExpiry: parseInt(process.env.EMAIL_VERIFICATION_EXPIRY) || 24 * 60 * 60 * 1000, // EN: 24 hours / FR: 24 heures
      maxAttempts: parseInt(process.env.EMAIL_VERIFICATION_MAX_ATTEMPTS) || 3
    }
  },

  // EN: Logging Configuration / FR: Configuration de journalisation
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableSecurityLogs: process.env.ENABLE_SECURITY_LOGS !== 'false',
    enableAuditLogs: process.env.ENABLE_AUDIT_LOGS !== 'false',
    logFile: process.env.LOG_FILE || './logs/security.log',
    maxLogSize: parseInt(process.env.MAX_LOG_SIZE) || 10 * 1024 * 1024, // EN: 10MB / FR: 10MB
    maxLogFiles: parseInt(process.env.MAX_LOG_FILES) || 5
  },

  // EN: API Security Configuration / FR: Configuration de sécurité API
  api: {
    version: process.env.API_VERSION || 'v1',
    enableApiKeyAuth: process.env.ENABLE_API_KEY_AUTH === 'true',
    apiKeyHeader: process.env.API_KEY_HEADER || 'X-API-Key',
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== 'false',
    enableResponseTime: process.env.ENABLE_RESPONSE_TIME !== 'false'
  },

  // EN: Environment-specific settings / FR: Paramètres spécifiques à l'environnement
  environment: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test'
  }
};

/**
 * EN: Validate security configuration
 * FR: Valider la configuration de sécurité
 */
const validateSecurityConfig = () => {
  const errors = [];

  // EN: Validate JWT secret strength / FR: Valider la force du secret JWT
  if (securityConfig.jwt.secret.length < 32) {
    errors.push('JWT secret must be at least 32 characters long');
  }

  // EN: Validate password requirements / FR: Valider les exigences de mot de passe
  if (securityConfig.password.minLength < 8) {
    errors.push('Password minimum length must be at least 8 characters');
  }

  if (securityConfig.password.bcryptRounds < 10) {
    errors.push('Bcrypt rounds must be at least 10 for security');
  }

  // EN: Validate rate limiting settings / FR: Valider les paramètres de limitation de taux
  if (securityConfig.rateLimit.authMaxAttempts < 3) {
    errors.push('Authentication rate limit must allow at least 3 attempts');
  }

  // EN: Validate lockout settings / FR: Valider les paramètres de verrouillage
  if (securityConfig.lockout.maxAttempts < 3) {
    errors.push('Lockout max attempts must be at least 3');
  }

  if (errors.length > 0) {
    console.error('❌ Security configuration validation failed:');
    errors.forEach(error => console.error(`   - ${error}`));
    throw new Error('Invalid security configuration');
  }

  console.log('✅ Security configuration validated successfully');
};

/**
 * EN: Get security recommendations based on environment
 * FR: Obtenir les recommandations de sécurité basées sur l'environnement
 */
const getSecurityRecommendations = () => {
  const recommendations = [];

  if (securityConfig.environment.isDevelopment) {
    recommendations.push('🔧 Development mode: Consider using stronger passwords in production');
    recommendations.push('🔧 Development mode: Enable HTTPS in production');
    recommendations.push('🔧 Development mode: Use environment variables for all secrets');
  }

  if (securityConfig.environment.isProduction) {
    recommendations.push('🚀 Production mode: Ensure all environment variables are set');
    recommendations.push('🚀 Production mode: Enable all security headers');
    recommendations.push('🚀 Production mode: Use strong, unique JWT secrets');
    recommendations.push('🚀 Production mode: Enable request logging and monitoring');
  }

  if (!process.env.JWT_SECRET) {
    recommendations.push('⚠️  JWT_SECRET not set in environment variables');
  }

  if (!process.env.SESSION_SECRET) {
    recommendations.push('⚠️  SESSION_SECRET not set in environment variables');
  }

  return recommendations;
};

// EN: Initialize security configuration / FR: Initialiser la configuration de sécurité
const initializeSecurity = () => {
  validateEnvironmentVariables();
  validateSecurityConfig();
  
  const recommendations = getSecurityRecommendations();
  if (recommendations.length > 0) {
    console.log('📋 Security recommendations:');
    recommendations.forEach(rec => console.log(`   ${rec}`));
  }
};

// EN: Initialize on import / FR: Initialiser à l'import
initializeSecurity();

export default securityConfig;
