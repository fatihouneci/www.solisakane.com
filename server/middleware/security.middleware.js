/**
 * @file security.middleware.js
 * @description
 * EN: This file contains security middleware functions for enhanced protection.
 * FR: Ce fichier contient les fonctions middleware de sécurité pour une protection renforcée.
 */
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import { 
  validatePassword, 
  sanitizeInput, 
  validateEmail,
  createAuthRateLimit,
  createHelmetConfig,
  generateSecureToken,
  hashPassword,
  comparePassword
} from '../security/securityAudit.js';
import User from '../models/user.model.js';
import Errors from '../helpers/Errors.js';
import CatchAsyncError from '../helpers/CatchAsyncError.js';

/**
 * EN: Security headers middleware
 * FR: Middleware des en-têtes de sécurité
 */
export const securityHeaders = createHelmetConfig();

/**
 * EN: Authentication rate limiting
 * FR: Limitation de taux d'authentification
 */
export const authRateLimit = createAuthRateLimit();

/**
 * EN: General rate limiting
 * FR: Limitation de taux générale
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // EN: 15 minutes / FR: 15 minutes
  max: 1000, // EN: Limit each IP to 1000 requests per windowMs / FR: Limiter chaque IP à 1000 requêtes par windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * EN: Input sanitization middleware
 * FR: Middleware d'assainissement des entrées
 */
export const sanitizeInputs = (req, res, next) => {
  // EN: Sanitize string inputs in body / FR: Assainir les entrées de chaîne dans le corps
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });
  }

  // EN: Sanitize string inputs in query / FR: Assainir les entrées de chaîne dans la requête
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeInput(req.query[key]);
      }
    });
  }

  // EN: Sanitize string inputs in params / FR: Assainir les entrées de chaîne dans les paramètres
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = sanitizeInput(req.params[key]);
      }
    });
  }

  next();
};

/**
 * EN: Password validation middleware
 * FR: Middleware de validation des mots de passe
 */
export const validatePasswordMiddleware = (req, res, next) => {
  const { password } = req.body;
  
  if (!password) {
    return next(new Errors('Password is required', 400));
  }

  const validation = validatePassword(password);
  
  if (!validation.isValid) {
    return next(new Errors(`Password validation failed: ${validation.errors.join(', ')}`, 400));
  }

  if (validation.warnings.length > 0) {
    // EN: Log warnings but don't block the request / FR: Enregistrer les avertissements mais ne pas bloquer la requête
    console.warn('Password warnings:', validation.warnings);
  }

  next();
};

/**
 * EN: Email validation middleware
 * FR: Middleware de validation d'email
 */
export const validateEmailMiddleware = (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return next(new Errors('Email is required', 400));
  }

  if (!validateEmail(email)) {
    return next(new Errors('Invalid email format', 400));
  }

  next();
};

/**
 * EN: Account lockout middleware
 * FR: Middleware de verrouillage de compte
 */
export const accountLockoutMiddleware = CatchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return next(new Errors('Email is required', 400));
  }

  const user = await User.findOne({ email });
  
  if (user && user.loginAttempts) {
    const { attempts, lockUntil } = user.loginAttempts;
    
    // EN: Check if account is locked / FR: Vérifier si le compte est verrouillé
    if (lockUntil && lockUntil > Date.now()) {
      const lockTimeRemaining = Math.ceil((lockUntil - Date.now()) / (1000 * 60));
      return next(new Errors(`Account is locked. Try again in ${lockTimeRemaining} minutes.`, 423));
    }
    
    // EN: Reset attempts if lock period has expired / FR: Réinitialiser les tentatives si la période de verrouillage a expiré
    if (lockUntil && lockUntil < Date.now()) {
      user.loginAttempts = undefined;
      await user.save();
    }
  }

  next();
});

/**
 * EN: Record failed login attempt
 * FR: Enregistrer une tentative de connexion échouée
 */
export const recordFailedLogin = CatchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  
  if (!email) return next();

  const user = await User.findOne({ email });
  
  if (user) {
    const now = Date.now();
    const lockTime = 2 * 60 * 60 * 1000; // EN: 2 hours / FR: 2 heures
    const maxAttempts = 5;

    if (!user.loginAttempts) {
      user.loginAttempts = {
        attempts: 1,
        lastAttempt: now
      };
    } else {
      const { attempts, lastAttempt } = user.loginAttempts;
      
      // EN: Reset attempts if last attempt was more than 1 hour ago / FR: Réinitialiser les tentatives si la dernière tentative était il y a plus d'une heure
      if (now - lastAttempt > 60 * 60 * 1000) {
        user.loginAttempts = {
          attempts: 1,
          lastAttempt: now
        };
      } else {
        user.loginAttempts.attempts = attempts + 1;
        user.loginAttempts.lastAttempt = now;
        
        // EN: Lock account if max attempts reached / FR: Verrouiller le compte si le max de tentatives est atteint
        if (user.loginAttempts.attempts >= maxAttempts) {
          user.loginAttempts.lockUntil = now + lockTime;
        }
      }
    }
    
    await user.save();
  }

  next();
});

/**
 * EN: Clear failed login attempts on successful login
 * FR: Effacer les tentatives de connexion échouées lors d'une connexion réussie
 */
export const clearFailedLogins = CatchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  
  if (!email) return next();

  const user = await User.findOne({ email });
  
  if (user && user.loginAttempts) {
    user.loginAttempts = undefined;
    await user.save();
  }

  next();
});

/**
 * EN: CSRF protection middleware
 * FR: Middleware de protection CSRF
 */
export const csrfProtection = (req, res, next) => {
  // EN: Skip CSRF for GET requests / FR: Ignorer CSRF pour les requêtes GET
  if (req.method === 'GET') {
    return next();
  }

  // EN: Check for CSRF token in header / FR: Vérifier le jeton CSRF dans l'en-tête
  const csrfToken = req.headers['x-csrf-token'];
  const sessionToken = req.session?.csrfToken;

  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    return next(new Errors('Invalid CSRF token', 403));
  }

  next();
};

/**
 * EN: Generate CSRF token
 * FR: Générer un jeton CSRF
 */
export const generateCSRFToken = (req, res, next) => {
  if (!req.session) {
    req.session = {};
  }
  
  req.session.csrfToken = generateSecureToken(32);
  res.locals.csrfToken = req.session.csrfToken;
  
  next();
};

/**
 * EN: Request logging middleware
 * FR: Middleware de journalisation des requêtes
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // EN: Log request details / FR: Enregistrer les détails de la requête
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent')}`);
  
  // EN: Log response details / FR: Enregistrer les détails de la réponse
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Status: ${res.statusCode} - Duration: ${duration}ms`);
  });
  
  next();
};

/**
 * EN: Security event logging
 * FR: Journalisation des événements de sécurité
 */
export const securityLogger = (event, details) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    severity: details.severity || 'INFO'
  };
  
  console.log(`[SECURITY] ${JSON.stringify(logEntry)}`);
  
  // EN: Here you would typically send to a security monitoring service / FR: Ici vous enverriez typiquement à un service de surveillance de sécurité
  // EN: For example: send to SIEM, log aggregation service, etc. / FR: Par exemple: envoyer à SIEM, service d'agrégation de logs, etc.
};

/**
 * EN: Validation error handler
 * FR: Gestionnaire d'erreurs de validation
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new Errors(`Validation failed: ${errorMessages.join(', ')}`, 400));
  }
  
  next();
};

/**
 * EN: Express validator rules for registration
 * FR: Règles de validation Express pour l'inscription
 */
export const registrationValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  handleValidationErrors
];

/**
 * EN: Express validator rules for login
 * FR: Règles de validation Express pour la connexion
 */
export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

/**
 * EN: Express validator rules for password reset
 * FR: Règles de validation Express pour la réinitialisation de mot de passe
 */
export const passwordResetValidation = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  handleValidationErrors
];

export default {
  securityHeaders,
  authRateLimit,
  generalRateLimit,
  sanitizeInputs,
  validatePasswordMiddleware,
  validateEmailMiddleware,
  accountLockoutMiddleware,
  recordFailedLogin,
  clearFailedLogins,
  csrfProtection,
  generateCSRFToken,
  requestLogger,
  securityLogger,
  handleValidationErrors,
  registrationValidation,
  loginValidation,
  passwordResetValidation
};
