/**
 * @file securityAudit.js
 * @description
 * EN: This file contains security audit functions and vulnerability assessments.
 * FR: Ce fichier contient les fonctions d'audit de sécurité et les évaluations de vulnérabilités.
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import validator from 'validator';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import config from '../config/config.js';

/**
 * EN: Security Audit Results
 * FR: Résultats de l'Audit de Sécurité
 */
export const securityAuditResults = {
  // EN: Critical Issues Found / FR: Problèmes Critiques Trouvés
  critical: [
    {
      id: 'SEC-001',
      title: 'Weak JWT Secret',
      description: 'JWT secret is using default value "YOUR_secret_key"',
      severity: 'CRITICAL',
      impact: 'Complete authentication bypass possible',
      recommendation: 'Use strong, random JWT secret from environment variables'
    },
    {
      id: 'SEC-002',
      title: 'No Password Validation',
      description: 'No password strength validation during registration',
      severity: 'HIGH',
      impact: 'Weak passwords can be used',
      recommendation: 'Implement password strength validation'
    },
    {
      id: 'SEC-003',
      title: 'No Rate Limiting',
      description: 'No rate limiting on authentication endpoints',
      severity: 'HIGH',
      impact: 'Brute force attacks possible',
      recommendation: 'Implement rate limiting on auth endpoints'
    },
    {
      id: 'SEC-004',
      title: 'No Input Sanitization',
      description: 'User inputs are not sanitized',
      severity: 'MEDIUM',
      impact: 'XSS and injection attacks possible',
      recommendation: 'Implement input sanitization and validation'
    },
    {
      id: 'SEC-005',
      title: 'Insecure Cookie Settings',
      description: 'Cookies lack secure flags',
      severity: 'MEDIUM',
      impact: 'Session hijacking possible',
      recommendation: 'Add secure, httpOnly, sameSite flags to cookies'
    }
  ],

  // EN: Security Best Practices Missing / FR: Bonnes Pratiques de Sécurité Manquantes
  missing: [
    {
      id: 'SEC-006',
      title: 'No CSRF Protection',
      description: 'No CSRF tokens implemented',
      severity: 'MEDIUM',
      impact: 'CSRF attacks possible',
      recommendation: 'Implement CSRF protection'
    },
    {
      id: 'SEC-007',
      title: 'No Security Headers',
      description: 'Missing security headers (helmet)',
      severity: 'MEDIUM',
      impact: 'Various client-side attacks possible',
      recommendation: 'Implement security headers with helmet'
    },
    {
      id: 'SEC-008',
      title: 'No Account Lockout',
      description: 'No account lockout after failed attempts',
      severity: 'MEDIUM',
      impact: 'Brute force attacks possible',
      recommendation: 'Implement account lockout mechanism'
    },
    {
      id: 'SEC-009',
      title: 'No Session Management',
      description: 'No proper session invalidation',
      severity: 'LOW',
      impact: 'Session management issues',
      recommendation: 'Implement proper session management'
    },
    {
      id: 'SEC-010',
      title: 'No Audit Logging',
      description: 'No security event logging',
      severity: 'LOW',
      impact: 'Security incidents not tracked',
      recommendation: 'Implement security audit logging'
    }
  ]
};

/**
 * EN: Password validation rules
 * FR: Règles de validation des mots de passe
 */
export const passwordValidationRules = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  forbiddenPatterns: [
    /password/i,
    /123456/i,
    /qwerty/i,
    /admin/i,
    /user/i
  ]
};

/**
 * EN: Validate password strength
 * FR: Valider la force du mot de passe
 * @param {string} password - Password to validate / Mot de passe à valider
 * @returns {object} Validation result / Résultat de validation
 */
export const validatePassword = (password) => {
  const errors = [];
  const warnings = [];

  // EN: Check minimum length / FR: Vérifier la longueur minimale
  if (password.length < passwordValidationRules.minLength) {
    errors.push(`Password must be at least ${passwordValidationRules.minLength} characters long`);
  }

  // EN: Check maximum length / FR: Vérifier la longueur maximale
  if (password.length > passwordValidationRules.maxLength) {
    errors.push(`Password must be no more than ${passwordValidationRules.maxLength} characters long`);
  }

  // EN: Check for uppercase letters / FR: Vérifier les lettres majuscules
  if (passwordValidationRules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // EN: Check for lowercase letters / FR: Vérifier les lettres minuscules
  if (passwordValidationRules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // EN: Check for numbers / FR: Vérifier les chiffres
  if (passwordValidationRules.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // EN: Check for special characters / FR: Vérifier les caractères spéciaux
  if (passwordValidationRules.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // EN: Check for forbidden patterns / FR: Vérifier les modèles interdits
  passwordValidationRules.forbiddenPatterns.forEach(pattern => {
    if (pattern.test(password)) {
      warnings.push('Password contains common patterns that should be avoided');
    }
  });

  // EN: Calculate password strength score / FR: Calculer le score de force du mot de passe
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  if (password.length >= 16) score += 1;

  const strength = score <= 2 ? 'weak' : score <= 4 ? 'medium' : score <= 6 ? 'strong' : 'very-strong';

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    strength,
    score
  };
};

/**
 * EN: Generate secure JWT secret
 * FR: Générer un secret JWT sécurisé
 * @returns {string} Secure JWT secret / Secret JWT sécurisé
 */
export const generateSecureJWTSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * EN: Validate JWT token
 * FR: Valider un jeton JWT
 * @param {string} token - JWT token to validate / Jeton JWT à valider
 * @param {string} secret - JWT secret / Secret JWT
 * @returns {object} Validation result / Résultat de validation
 */
export const validateJWT = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return {
      isValid: true,
      payload: decoded,
      error: null
    };
  } catch (error) {
    return {
      isValid: false,
      payload: null,
      error: error.message
    };
  }
};

/**
 * EN: Sanitize user input
 * FR: Assainir l'entrée utilisateur
 * @param {string} input - Input to sanitize / Entrée à assainir
 * @returns {string} Sanitized input / Entrée assainie
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // EN: Remove potentially dangerous characters / FR: Supprimer les caractères potentiellement dangereux
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // EN: Remove script tags / FR: Supprimer les balises script
    .replace(/javascript:/gi, '') // EN: Remove javascript: protocol / FR: Supprimer le protocole javascript:
    .replace(/on\w+\s*=/gi, '') // EN: Remove event handlers / FR: Supprimer les gestionnaires d'événements
    .trim();
};

/**
 * EN: Validate email format
 * FR: Valider le format d'email
 * @param {string} email - Email to validate / Email à valider
 * @returns {boolean} Is valid email / Email valide
 */
export const validateEmail = (email) => {
  return validator.isEmail(email) && email.length <= 254;
};

/**
 * EN: Create rate limiting configuration
 * FR: Créer la configuration de limitation de taux
 * @param {object} options - Rate limiting options / Options de limitation de taux
 * @returns {object} Rate limiter configuration / Configuration du limiteur de taux
 */
export const createRateLimit = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // EN: 15 minutes / FR: 15 minutes
    max: 100, // EN: Limit each IP to 100 requests per windowMs / FR: Limiter chaque IP à 100 requêtes par windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    ...options
  };

  return rateLimit(defaultOptions);
};

/**
 * EN: Create authentication rate limiting
 * FR: Créer la limitation de taux d'authentification
 * @returns {object} Auth rate limiter / Limiteur de taux d'auth
 */
export const createAuthRateLimit = () => {
  return createRateLimit({
    windowMs: 15 * 60 * 1000, // EN: 15 minutes / FR: 15 minutes
    max: 5, // EN: Limit each IP to 5 login attempts per windowMs / FR: Limiter chaque IP à 5 tentatives de connexion par windowMs
    message: {
      success: false,
      message: 'Too many login attempts, please try again later.'
    },
    skipSuccessfulRequests: true // EN: Don't count successful requests / FR: Ne pas compter les requêtes réussies
  });
};

/**
 * EN: Create helmet security configuration
 * FR: Créer la configuration de sécurité helmet
 * @returns {object} Helmet configuration / Configuration helmet
 */
export const createHelmetConfig = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  });
};

/**
 * EN: Generate secure random token
 * FR: Générer un jeton aléatoire sécurisé
 * @param {number} length - Token length / Longueur du jeton
 * @returns {string} Secure random token / Jeton aléatoire sécurisé
 */
export const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * EN: Hash password with bcrypt
 * FR: Hacher un mot de passe avec bcrypt
 * @param {string} password - Password to hash / Mot de passe à hacher
 * @param {number} rounds - Bcrypt rounds / Tours de bcrypt
 * @returns {Promise<string>} Hashed password / Mot de passe haché
 */
export const hashPassword = async (password, rounds = 12) => {
  return await bcrypt.hash(password, rounds);
};

/**
 * EN: Compare password with hash
 * FR: Comparer un mot de passe avec un hash
 * @param {string} password - Plain password / Mot de passe en clair
 * @param {string} hash - Hashed password / Mot de passe haché
 * @returns {Promise<boolean>} Password match / Correspondance du mot de passe
 */
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * EN: Security audit summary
 * FR: Résumé de l'audit de sécurité
 */
export const getSecurityAuditSummary = () => {
  const criticalCount = securityAuditResults.critical.length;
  const missingCount = securityAuditResults.missing.length;
  const totalIssues = criticalCount + missingCount;

  return {
    totalIssues,
    criticalIssues: criticalCount,
    missingFeatures: missingCount,
    securityScore: Math.max(0, 100 - (criticalCount * 20) - (missingCount * 5)),
    recommendations: [
      'Implement strong JWT secret from environment variables',
      'Add password strength validation',
      'Implement rate limiting on authentication endpoints',
      'Add input sanitization and validation',
      'Configure secure cookie settings',
      'Implement CSRF protection',
      'Add security headers with helmet',
      'Implement account lockout mechanism',
      'Add proper session management',
      'Implement security audit logging'
    ]
  };
};

export default {
  securityAuditResults,
  passwordValidationRules,
  validatePassword,
  generateSecureJWTSecret,
  validateJWT,
  sanitizeInput,
  validateEmail,
  createRateLimit,
  createAuthRateLimit,
  createHelmetConfig,
  generateSecureToken,
  hashPassword,
  comparePassword,
  getSecurityAuditSummary
};
