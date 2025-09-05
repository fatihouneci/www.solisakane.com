/**
 * @file settings.routes.js
 * @description
 * EN: This file defines the API routes for user settings and preferences management.
 * FR: Ce fichier définit les routes API pour la gestion des paramètres et préférences utilisateur.
 */
import express from "express";
import settingsCtrl from "../controllers/settings.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// EN: Route for getting all user settings (requires signin) / FR: Route pour récupérer tous les paramètres utilisateur (nécessite une connexion)
router.route("/")
  .get(authCtrl.requireSignin, settingsCtrl.getSettings);

// EN: Route for updating notification settings (requires signin) / FR: Route pour mettre à jour les paramètres de notification (nécessite une connexion)
router.route("/notifications")
  .put(authCtrl.requireSignin, settingsCtrl.updateNotificationSettings);

// EN: Route for updating privacy settings (requires signin) / FR: Route pour mettre à jour les paramètres de confidentialité (nécessite une connexion)
router.route("/privacy")
  .put(authCtrl.requireSignin, settingsCtrl.updatePrivacySettings);

// EN: Route for updating audio/video settings (requires signin) / FR: Route pour mettre à jour les paramètres audio/vidéo (nécessite une connexion)
router.route("/audio-video")
  .put(authCtrl.requireSignin, settingsCtrl.updateAudioVideoSettings);

// EN: Route for updating theme settings (requires signin) / FR: Route pour mettre à jour les paramètres de thème (nécessite une connexion)
router.route("/theme")
  .put(authCtrl.requireSignin, settingsCtrl.updateThemeSettings);

// EN: Route for updating security settings (requires signin) / FR: Route pour mettre à jour les paramètres de sécurité (nécessite une connexion)
router.route("/security")
  .put(authCtrl.requireSignin, settingsCtrl.updateSecuritySettings);

// EN: Route for updating data settings (requires signin) / FR: Route pour mettre à jour les paramètres de données (nécessite une connexion)
router.route("/data")
  .put(authCtrl.requireSignin, settingsCtrl.updateDataSettings);

// EN: Route for changing password (requires signin) / FR: Route pour changer le mot de passe (nécessite une connexion)
router.route("/change-password")
  .put(authCtrl.requireSignin, settingsCtrl.changePassword);

// EN: Route for setting up two-factor authentication (requires signin) / FR: Route pour configurer l'authentification à deux facteurs (nécessite une connexion)
router.route("/2fa/setup")
  .post(authCtrl.requireSignin, settingsCtrl.setupTwoFactorAuth);

// EN: Route for verifying two-factor authentication setup (requires signin) / FR: Route pour vérifier la configuration de l'authentification à deux facteurs (nécessite une connexion)
router.route("/2fa/verify")
  .post(authCtrl.requireSignin, settingsCtrl.verifyTwoFactorAuth);

// EN: Route for disabling two-factor authentication (requires signin) / FR: Route pour désactiver l'authentification à deux facteurs (nécessite une connexion)
router.route("/2fa/disable")
  .post(authCtrl.requireSignin, settingsCtrl.disableTwoFactorAuth);

// EN: Route for getting user devices (requires signin) / FR: Route pour récupérer les appareils utilisateur (nécessite une connexion)
router.route("/devices")
  .get(authCtrl.requireSignin, settingsCtrl.getUserDevices);

// EN: Route for removing a device (requires signin) / FR: Route pour supprimer un appareil (nécessite une connexion)
router.route("/devices/:deviceId")
  .delete(authCtrl.requireSignin, settingsCtrl.removeDevice);

export default router;
