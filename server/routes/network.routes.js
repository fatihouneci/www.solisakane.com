/**
 * @file network.routes.js
 * @description
 * EN: This file defines the API routes for network and technical operations.
 * FR: Ce fichier définit les routes API pour les opérations réseau et techniques.
 */
import express from "express";
import networkCtrl from "../controllers/network.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// EN: Route for getting network status (requires signin) / FR: Route pour récupérer le statut réseau (nécessite une connexion)
router.route("/:deviceId/status")
  .get(authCtrl.requireSignin, networkCtrl.getNetworkStatus);

// EN: Route for updating connection status (requires signin) / FR: Route pour mettre à jour le statut de connexion (nécessite une connexion)
router.route("/:deviceId/connection")
  .put(authCtrl.requireSignin, networkCtrl.updateConnectionStatus);

// EN: Route for getting data saving mode settings (requires signin) / FR: Route pour récupérer les paramètres du mode d'économie de données (nécessite une connexion)
router.route("/:deviceId/data-saving")
  .get(authCtrl.requireSignin, networkCtrl.getDataSavingMode)
  .put(authCtrl.requireSignin, networkCtrl.updateDataSavingMode);

// EN: Route for updating data usage (requires signin) / FR: Route pour mettre à jour l'utilisation des données (nécessite une connexion)
router.route("/:deviceId/data-usage")
  .put(authCtrl.requireSignin, networkCtrl.updateDataUsage);

// EN: Route for getting sync status (requires signin) / FR: Route pour récupérer le statut de synchronisation (nécessite une connexion)
router.route("/:deviceId/sync")
  .get(authCtrl.requireSignin, networkCtrl.getSyncStatus)
  .put(authCtrl.requireSignin, networkCtrl.updateSyncSettings);

// EN: Route for adding pending sync item (requires signin) / FR: Route pour ajouter un élément de sync en attente (nécessite une connexion)
router.route("/:deviceId/sync/pending")
  .post(authCtrl.requireSignin, networkCtrl.addPendingSync);

// EN: Route for recording sync error (requires signin) / FR: Route pour enregistrer une erreur de sync (nécessite une connexion)
router.route("/:deviceId/sync/error")
  .post(authCtrl.requireSignin, networkCtrl.recordSyncError);

// EN: Route for getting backup settings (requires signin) / FR: Route pour récupérer les paramètres de sauvegarde (nécessite une connexion)
router.route("/:deviceId/backup")
  .get(authCtrl.requireSignin, networkCtrl.getBackupSettings)
  .put(authCtrl.requireSignin, networkCtrl.updateBackupSettings);

// EN: Route for triggering manual backup (requires signin) / FR: Route pour déclencher une sauvegarde manuelle (nécessite une connexion)
router.route("/:deviceId/backup/trigger")
  .post(authCtrl.requireSignin, networkCtrl.triggerBackup);

// EN: Route for getting emoji settings (requires signin) / FR: Route pour récupérer les paramètres d'emojis (nécessite une connexion)
router.route("/:deviceId/emoji")
  .get(authCtrl.requireSignin, networkCtrl.getEmojiSettings)
  .put(authCtrl.requireSignin, networkCtrl.updateEmojiSettings);

// EN: Route for adding recent emoji (requires signin) / FR: Route pour ajouter un emoji récent (nécessite une connexion)
router.route("/:deviceId/emoji/recent")
  .post(authCtrl.requireSignin, networkCtrl.addRecentEmoji);

// EN: Route for getting network statistics (requires signin) / FR: Route pour récupérer les statistiques réseau (nécessite une connexion)
router.route("/:deviceId/stats")
  .get(authCtrl.requireSignin, networkCtrl.getNetworkStats);

export default router;
