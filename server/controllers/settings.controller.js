/**
 * @file settings.controller.js
 * @description
 * EN: This file contains the controller functions for user settings and preferences management.
 * FR: Ce fichier contient les fonctions du contrôleur pour la gestion des paramètres et préférences utilisateur.
 */
import User from "../models/user.model.js";
import Errors from "../helpers/Errors.js";
import CatchAsyncError from "../helpers/CatchAsyncError.js";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

/**
 * EN: Get user settings
 * FR: Récupérer les paramètres utilisateur
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getSettings = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;

    const user = await User.findById(userId).select(
      'notificationSettings privacySettings audioVideoSettings themeSettings securitySettings dataSettings'
    );

    if (!user) {
      return next(new Errors("Utilisateur non trouvé", 404));
    }

    res.status(200).json({
      success: true,
      settings: {
        notifications: user.notificationSettings,
        privacy: user.privacySettings,
        audioVideo: user.audioVideoSettings,
        theme: user.themeSettings,
        security: user.securitySettings,
        data: user.dataSettings
      },
      message: "Paramètres récupérés avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Update notification settings
 * FR: Mettre à jour les paramètres de notification
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const updateNotificationSettings = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const notificationSettings = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { notificationSettings } },
      { new: true, runValidators: true }
    ).select('notificationSettings');

    if (!user) {
      return next(new Errors("Utilisateur non trouvé", 404));
    }

    res.status(200).json({
      success: true,
      settings: user.notificationSettings,
      message: "Paramètres de notification mis à jour avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Update privacy settings
 * FR: Mettre à jour les paramètres de confidentialité
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const updatePrivacySettings = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const privacySettings = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { privacySettings } },
      { new: true, runValidators: true }
    ).select('privacySettings');

    if (!user) {
      return next(new Errors("Utilisateur non trouvé", 404));
    }

    res.status(200).json({
      success: true,
      settings: user.privacySettings,
      message: "Paramètres de confidentialité mis à jour avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Update audio/video settings
 * FR: Mettre à jour les paramètres audio/vidéo
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const updateAudioVideoSettings = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const audioVideoSettings = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { audioVideoSettings } },
      { new: true, runValidators: true }
    ).select('audioVideoSettings');

    if (!user) {
      return next(new Errors("Utilisateur non trouvé", 404));
    }

    res.status(200).json({
      success: true,
      settings: user.audioVideoSettings,
      message: "Paramètres audio/vidéo mis à jour avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Update theme settings
 * FR: Mettre à jour les paramètres de thème
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const updateThemeSettings = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const themeSettings = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { themeSettings } },
      { new: true, runValidators: true }
    ).select('themeSettings');

    if (!user) {
      return next(new Errors("Utilisateur non trouvé", 404));
    }

    res.status(200).json({
      success: true,
      settings: user.themeSettings,
      message: "Paramètres de thème mis à jour avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Update security settings
 * FR: Mettre à jour les paramètres de sécurité
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const updateSecuritySettings = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const securitySettings = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { securitySettings } },
      { new: true, runValidators: true }
    ).select('securitySettings');

    if (!user) {
      return next(new Errors("Utilisateur non trouvé", 404));
    }

    res.status(200).json({
      success: true,
      settings: user.securitySettings,
      message: "Paramètres de sécurité mis à jour avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Update data settings
 * FR: Mettre à jour les paramètres de données
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const updateDataSettings = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const dataSettings = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { dataSettings } },
      { new: true, runValidators: true }
    ).select('dataSettings');

    if (!user) {
      return next(new Errors("Utilisateur non trouvé", 404));
    }

    res.status(200).json({
      success: true,
      settings: user.dataSettings,
      message: "Paramètres de données mis à jour avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Setup two-factor authentication
 * FR: Configurer l'authentification à deux facteurs
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const setupTwoFactorAuth = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const user = await User.findById(userId);

    if (!user) {
      return next(new Errors("Utilisateur non trouvé", 404));
    }

    // EN: Generate secret for 2FA / FR: Générer le secret pour 2FA
    const secret = speakeasy.generateSecret({
      name: `Solisakane (${user.email})`,
      issuer: 'Solisakane'
    });

    // EN: Generate backup codes / FR: Générer les codes de sauvegarde
    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    // EN: Generate QR code / FR: Générer le code QR
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // EN: Save secret and backup codes to user / FR: Sauvegarder le secret et les codes de sauvegarde à l'utilisateur
    user.securitySettings.twoFactorAuth.secret = secret.base32;
    user.securitySettings.twoFactorAuth.backupCodes = backupCodes;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        backupCodes: backupCodes
      },
      message: "Authentification à deux facteurs configurée avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Verify two-factor authentication setup
 * FR: Vérifier la configuration de l'authentification à deux facteurs
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const verifyTwoFactorAuth = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { token } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return next(new Errors("Utilisateur non trouvé", 404));
    }

    if (!user.securitySettings.twoFactorAuth.secret) {
      return next(new Errors("Authentification à deux facteurs non configurée", 400));
    }

    // EN: Verify the token / FR: Vérifier le jeton
    const verified = speakeasy.totp.verify({
      secret: user.securitySettings.twoFactorAuth.secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (verified) {
      // EN: Enable 2FA / FR: Activer 2FA
      user.securitySettings.twoFactorAuth.enabled = true;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Authentification à deux facteurs activée avec succès"
      });
    } else {
      return next(new Errors("Code de vérification invalide", 400));
    }
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Disable two-factor authentication
 * FR: Désactiver l'authentification à deux facteurs
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const disableTwoFactorAuth = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { password, token } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return next(new Errors("Utilisateur non trouvé", 404));
    }

    // EN: Verify password / FR: Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new Errors("Mot de passe incorrect", 400));
    }

    // EN: Verify 2FA token if provided / FR: Vérifier le jeton 2FA si fourni
    if (user.securitySettings.twoFactorAuth.enabled && token) {
      const verified = speakeasy.totp.verify({
        secret: user.securitySettings.twoFactorAuth.secret,
        encoding: 'base32',
        token: token,
        window: 2
      });

      if (!verified) {
        return next(new Errors("Code de vérification invalide", 400));
      }
    }

    // EN: Disable 2FA / FR: Désactiver 2FA
    user.securitySettings.twoFactorAuth.enabled = false;
    user.securitySettings.twoFactorAuth.secret = null;
    user.securitySettings.twoFactorAuth.backupCodes = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: "Authentification à deux facteurs désactivée avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Change password
 * FR: Changer le mot de passe
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const changePassword = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return next(new Errors("Les nouveaux mots de passe ne correspondent pas", 400));
    }

    if (newPassword.length < 6) {
      return next(new Errors("Le nouveau mot de passe doit contenir au moins 6 caractères", 400));
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(new Errors("Utilisateur non trouvé", 404));
    }

    // EN: Verify current password / FR: Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return next(new Errors("Mot de passe actuel incorrect", 400));
    }

    // EN: Update password / FR: Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Mot de passe modifié avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get user devices
 * FR: Récupérer les appareils utilisateur
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getUserDevices = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;

    const user = await User.findById(userId).select('securitySettings.allowedDevices');

    if (!user) {
      return next(new Errors("Utilisateur non trouvé", 404));
    }

    res.status(200).json({
      success: true,
      devices: user.securitySettings.allowedDevices || [],
      message: "Appareils récupérés avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Remove a trusted device
 * FR: Supprimer un appareil de confiance
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const removeDevice = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { deviceId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return next(new Errors("Utilisateur non trouvé", 404));
    }

    // EN: Remove device from allowed devices / FR: Supprimer l'appareil des appareils autorisés
    user.securitySettings.allowedDevices = user.securitySettings.allowedDevices.filter(
      device => device.deviceId !== deviceId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Appareil supprimé avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

export default {
  getSettings,
  updateNotificationSettings,
  updatePrivacySettings,
  updateAudioVideoSettings,
  updateThemeSettings,
  updateSecuritySettings,
  updateDataSettings,
  setupTwoFactorAuth,
  verifyTwoFactorAuth,
  disableTwoFactorAuth,
  changePassword,
  getUserDevices,
  removeDevice
};
