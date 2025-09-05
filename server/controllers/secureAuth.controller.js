/**
 * @file secureAuth.controller.js
 * @description
 * EN: This file contains secure authentication controller functions with enhanced security measures.
 * FR: Ce fichier contient les fonctions du contrôleur d'authentification sécurisé avec des mesures de sécurité renforcées.
 */
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { expressjwt } from "express-jwt";
import Errors from "../helpers/Errors.js";
import Utility from "../helpers/Utility.js";
import sendMail from "../helpers/email.js";
import config from "../config/config.js";
import CatchAsyncError from "../helpers/CatchAsyncError.js";
import { 
  hashPassword, 
  comparePassword, 
  validatePassword, 
  validateEmail,
  generateSecureToken,
  securityLogger
} from "../security/securityAudit.js";
import { 
  accountLockoutMiddleware, 
  recordFailedLogin, 
  clearFailedLogins,
  securityLogger as logSecurityEvent
} from "../middleware/security.middleware.js";

/**
 * EN: Secure user registration with enhanced validation
 * FR: Inscription sécurisée d'utilisateur avec validation renforcée
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const secureRegister = CatchAsyncError(async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // EN: Validate email format / FR: Valider le format d'email
    if (!validateEmail(email)) {
      return next(new Errors("Invalid email format", 400));
    }

    // EN: Check if email already exists / FR: Vérifier si l'email existe déjà
    const isEmailExist = await User.findOne({ email: email.toLowerCase() });
    if (isEmailExist) {
      logSecurityEvent('REGISTRATION_ATTEMPT_DUPLICATE_EMAIL', { email, ip: req.ip });
      return next(new Errors("Cette adresse existe déjà", 400));
    }

    // EN: Validate password strength / FR: Valider la force du mot de passe
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      logSecurityEvent('REGISTRATION_ATTEMPT_WEAK_PASSWORD', { email, errors: passwordValidation.errors });
      return next(new Errors(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400));
    }

    // EN: Hash password with higher rounds / FR: Hacher le mot de passe avec plus de tours
    const hashedPassword = await hashPassword(password, 12);

    // EN: Create user with secure defaults / FR: Créer l'utilisateur avec des valeurs par défaut sécurisées
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      isActive: false, // EN: Require email activation / FR: Exiger l'activation par email
      emailVerified: false,
      lastLogin: null,
      loginAttempts: undefined
    });

    // EN: Generate secure activation token / FR: Générer un jeton d'activation sécurisé
    const activation = Utility.generateActivationToken(user);
    let data = { user, activationCode: activation.activationCode };

    // EN: Send activation email / FR: Envoyer l'email d'activation
    await sendMail({
      to: user.email,
      subject: "Activation du compte Solisakane",
      template: "activation-mail.ejs",
      data,
    });

    logSecurityEvent('REGISTRATION_SUCCESS', { email, ip: req.ip });

    res.status(201).json({
      success: true,
      message: `Veuillez vérifier votre e-mail : ${user.email}, Pour activer votre compte`,
      activationToken: activation.token,
    });
  } catch (error) {
    logSecurityEvent('REGISTRATION_ERROR', { error: error.message, ip: req.ip });
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Secure account activation with enhanced validation
 * FR: Activation sécurisée de compte avec validation renforcée
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const secureActivation = CatchAsyncError(async (req, res, next) => {
  try {
    const { activation_token, activation_code } = req.body;

    // EN: Validate activation token / FR: Valider le jeton d'activation
    const token = Utility.verifyActivationToken(activation_token);
    if (token.activationCode !== activation_code) {
      logSecurityEvent('ACTIVATION_ATTEMPT_INVALID_CODE', { ip: req.ip });
      return next(new Errors("Activation code invalide!", 400));
    }

    // EN: Check if email already exists / FR: Vérifier si l'email existe déjà
    const isEmailExist = await User.findOne({ email: token.email });
    if (isEmailExist) {
      logSecurityEvent('ACTIVATION_ATTEMPT_DUPLICATE_EMAIL', { email: token.email, ip: req.ip });
      return next(new Errors("Cette adresse existe déjà", 400));
    }

    const { email } = token;

    // EN: Create user with secure defaults / FR: Créer l'utilisateur avec des valeurs par défaut sécurisées
    let user = new User({ 
      email: email.toLowerCase(),
      isActive: true,
      emailVerified: true,
      lastLogin: new Date()
    });
    await user.save();

    // EN: Generate secure JWT token / FR: Générer un jeton JWT sécurisé
    const access_token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        iat: Math.floor(Date.now() / 1000)
      },
      config.jwtSecret,
      { expiresIn: '24h' } // EN: Token expires in 24 hours / FR: Le jeton expire dans 24 heures
    );

    // EN: Set secure cookie / FR: Définir un cookie sécurisé
    res.cookie("t", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // EN: 24 hours / FR: 24 heures
    });

    logSecurityEvent('ACTIVATION_SUCCESS', { email: user.email, ip: req.ip });

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        emailVerified: user.emailVerified
      },
      token: access_token,
    });
  } catch (error) {
    logSecurityEvent('ACTIVATION_ERROR', { error: error.message, ip: req.ip });
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Secure user sign-in with enhanced security measures
 * FR: Connexion sécurisée d'utilisateur avec des mesures de sécurité renforcées
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const secureSignin = CatchAsyncError(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // EN: Validate email format / FR: Valider le format d'email
    if (!validateEmail(email)) {
      logSecurityEvent('LOGIN_ATTEMPT_INVALID_EMAIL', { email, ip: req.ip });
      return next(new Errors("Invalid email format", 400));
    }

    // EN: Find user by email / FR: Trouver l'utilisateur par email
    let user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user || user.isDeleted === true) {
      logSecurityEvent('LOGIN_ATTEMPT_USER_NOT_FOUND', { email, ip: req.ip });
      return next(new Errors("Utilisateur introuvable !", 401));
    }

    // EN: Check if account is locked / FR: Vérifier si le compte est verrouillé
    if (user.loginAttempts && user.loginAttempts.lockUntil && user.loginAttempts.lockUntil > Date.now()) {
      const lockTimeRemaining = Math.ceil((user.loginAttempts.lockUntil - Date.now()) / (1000 * 60));
      logSecurityEvent('LOGIN_ATTEMPT_LOCKED_ACCOUNT', { email, ip: req.ip, lockTimeRemaining });
      return next(new Errors(`Account is locked. Try again in ${lockTimeRemaining} minutes.`, 423));
    }

    // EN: Check if account is active / FR: Vérifier si le compte est actif
    if (!user.isActive) {
      logSecurityEvent('LOGIN_ATTEMPT_INACTIVE_ACCOUNT', { email, ip: req.ip });
      return next(new Errors("Account is not active. Please activate your account first.", 401));
    }

    // EN: Verify password / FR: Vérifier le mot de passe
    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      // EN: Record failed login attempt / FR: Enregistrer la tentative de connexion échouée
      await recordFailedLogin(req, res, () => {});
      
      logSecurityEvent('LOGIN_ATTEMPT_INVALID_PASSWORD', { email, ip: req.ip });
      return next(new Errors("L'e-mail et le mot de passe ne correspondent pas.", 401));
    }

    // EN: Clear failed login attempts on successful login / FR: Effacer les tentatives de connexion échouées lors d'une connexion réussie
    await clearFailedLogins(req, res, () => {});

    // EN: Update last login time / FR: Mettre à jour l'heure de dernière connexion
    user.lastLogin = new Date();
    user.loginAttempts = undefined;
    await user.save();

    // EN: Generate secure JWT token / FR: Générer un jeton JWT sécurisé
    const access_token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        iat: Math.floor(Date.now() / 1000)
      },
      config.jwtSecret,
      { expiresIn: '24h' } // EN: Token expires in 24 hours / FR: Le jeton expire dans 24 heures
    );

    // EN: Set secure cookie / FR: Définir un cookie sécurisé
    res.cookie("t", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // EN: 24 hours / FR: 24 heures
    });

    logSecurityEvent('LOGIN_SUCCESS', { email: user.email, ip: req.ip });

    return res.status(200).json({
      success: true,
      token: access_token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    logSecurityEvent('LOGIN_ERROR', { error: error.message, ip: req.ip });
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Secure password reset with enhanced validation
 * FR: Réinitialisation sécurisée de mot de passe avec validation renforcée
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const secureResetPassword = CatchAsyncError(async (req, res, next) => {
  try {
    const { userId, password } = req.body;

    // EN: Validate password strength / FR: Valider la force du mot de passe
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      logSecurityEvent('PASSWORD_RESET_ATTEMPT_WEAK_PASSWORD', { userId, errors: passwordValidation.errors });
      return next(new Errors(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400));
    }

    const user = await User.findById(userId);
    if (!user) {
      logSecurityEvent('PASSWORD_RESET_ATTEMPT_USER_NOT_FOUND', { userId, ip: req.ip });
      return next(new Errors("Utilisateur introuvable", 400));
    }

    // EN: Hash new password with higher rounds / FR: Hacher le nouveau mot de passe avec plus de tours
    const hashedPassword = await hashPassword(password, 12);
    
    // EN: Update password and clear reset token / FR: Mettre à jour le mot de passe et effacer le jeton de réinitialisation
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.loginAttempts = undefined; // EN: Clear any lockout / FR: Effacer tout verrouillage
    await user.save();

    logSecurityEvent('PASSWORD_RESET_SUCCESS', { userId: user._id, email: user.email, ip: req.ip });

    res.status(200).json({
      success: true,
      message: "Réinitialisation du mot de passe réussie, vous pouvez maintenant vous connecter"
    });
  } catch (error) {
    logSecurityEvent('PASSWORD_RESET_ERROR', { error: error.message, ip: req.ip });
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Secure password change for authenticated users
 * FR: Changement sécurisé de mot de passe pour les utilisateurs authentifiés
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const secureChangePassword = CatchAsyncError(async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.auth._id;

    if (!currentPassword || !newPassword) {
      return next(new Errors("Current password and new password are required", 400));
    }

    // EN: Validate new password strength / FR: Valider la force du nouveau mot de passe
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      logSecurityEvent('PASSWORD_CHANGE_ATTEMPT_WEAK_PASSWORD', { userId, errors: passwordValidation.errors });
      return next(new Errors(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400));
    }

    // EN: Get user and verify current password / FR: Récupérer l'utilisateur et vérifier le mot de passe actuel
    const user = await User.findById(userId);
    if (!user) {
      return next(new Errors("Utilisateur introuvable", 404));
    }

    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      logSecurityEvent('PASSWORD_CHANGE_ATTEMPT_INVALID_CURRENT', { userId, ip: req.ip });
      return next(new Errors("Current password is incorrect", 400));
    }

    // EN: Hash new password / FR: Hacher le nouveau mot de passe
    const hashedNewPassword = await hashPassword(newPassword, 12);
    user.password = hashedNewPassword;
    await user.save();

    logSecurityEvent('PASSWORD_CHANGE_SUCCESS', { userId, email: user.email, ip: req.ip });

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    logSecurityEvent('PASSWORD_CHANGE_ERROR', { error: error.message, ip: req.ip });
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Enhanced JWT middleware with better error handling
 * FR: Middleware JWT amélioré avec une meilleure gestion d'erreurs
 */
const secureRequireSignin = expressjwt({
  secret: config.jwtSecret,
  userProperty: "auth",
  algorithms: ["HS256"],
  requestProperty: 'auth',
  getToken: (req) => {
    // EN: Check for token in Authorization header / FR: Vérifier le jeton dans l'en-tête Authorization
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    }
    // EN: Check for token in cookies / FR: Vérifier le jeton dans les cookies
    if (req.cookies && req.cookies.t) {
      return req.cookies.t;
    }
    return null;
  }
});

/**
 * EN: Enhanced authorization middleware
 * FR: Middleware d'autorisation amélioré
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const secureHasAuthorization = CatchAsyncError(async (req, res, next) => {
  try {
    // EN: Check if user is authenticated / FR: Vérifier si l'utilisateur est authentifié
    if (!req.auth || !req.auth._id) {
      logSecurityEvent('AUTHORIZATION_ATTEMPT_NO_AUTH', { ip: req.ip, path: req.path });
      return next(new Errors("Authentication required", 401));
    }

    // EN: Check if user exists and is active / FR: Vérifier si l'utilisateur existe et est actif
    const user = await User.findById(req.auth._id);
    if (!user || user.isDeleted || !user.isActive) {
      logSecurityEvent('AUTHORIZATION_ATTEMPT_INVALID_USER', { userId: req.auth._id, ip: req.ip });
      return next(new Errors("User not found or inactive", 403));
    }

    // EN: Check if user is trying to access their own resources / FR: Vérifier si l'utilisateur essaie d'accéder à ses propres ressources
    const resourceUserId = req.params.userId || req.body.userId;
    if (resourceUserId && resourceUserId !== req.auth._id.toString()) {
      logSecurityEvent('AUTHORIZATION_ATTEMPT_UNAUTHORIZED_ACCESS', { 
        userId: req.auth._id, 
        resourceUserId, 
        ip: req.ip, 
        path: req.path 
      });
      return next(new Errors("Access denied", 403));
    }

    next();
  } catch (error) {
    logSecurityEvent('AUTHORIZATION_ERROR', { error: error.message, ip: req.ip });
    next(new Errors("Authorization error", 500));
  }
});

/**
 * EN: Secure sign-out with token invalidation
 * FR: Déconnexion sécurisée avec invalidation du jeton
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const secureSignout = CatchAsyncError(async (req, res, next) => {
  try {
    // EN: Clear secure cookie / FR: Effacer le cookie sécurisé
    res.clearCookie("t", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    logSecurityEvent('LOGOUT_SUCCESS', { userId: req.auth?._id, ip: req.ip });

    return res.status(200).json({
      success: true,
      message: "Signed out successfully"
    });
  } catch (error) {
    logSecurityEvent('LOGOUT_ERROR', { error: error.message, ip: req.ip });
    next(new Errors(error.message, 400));
  }
});

export default {
  secureRegister,
  secureActivation,
  secureSignin,
  secureResetPassword,
  secureChangePassword,
  secureRequireSignin,
  secureHasAuthorization,
  secureSignout
};
