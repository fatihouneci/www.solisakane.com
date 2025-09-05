/**
 * @file notification.routes.js
 * @description
 * EN: This file defines the API routes for notification operations.
 * FR: Ce fichier définit les routes API pour les opérations de notifications.
 */
import express from "express";
import notificationCtrl from "../controllers/notification.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// EN: Route for getting user notifications (requires signin) / FR: Route pour récupérer les notifications utilisateur (nécessite une connexion)
router.route("/")
  .get(authCtrl.requireSignin, notificationCtrl.getNotifications);

// EN: Route for creating a notification (requires signin) / FR: Route pour créer une notification (nécessite une connexion)
router.route("/create")
  .post(authCtrl.requireSignin, notificationCtrl.createNotification);

// EN: Route for creating multiple notifications (requires signin) / FR: Route pour créer plusieurs notifications (nécessite une connexion)
router.route("/create-multiple")
  .post(authCtrl.requireSignin, notificationCtrl.createMultipleNotifications);

// EN: Route for getting notification settings (requires signin) / FR: Route pour récupérer les paramètres de notifications (nécessite une connexion)
router.route("/settings")
  .get(authCtrl.requireSignin, notificationCtrl.getNotificationSettings)
  .put(authCtrl.requireSignin, notificationCtrl.updateNotificationSettings);

// EN: Route for testing notification delivery (requires signin) / FR: Route pour tester la livraison de notification (nécessite une connexion)
router.route("/test")
  .post(authCtrl.requireSignin, notificationCtrl.testNotification);

// EN: Route for getting notification statistics (requires signin) / FR: Route pour récupérer les statistiques de notifications (nécessite une connexion)
router.route("/stats")
  .get(authCtrl.requireSignin, notificationCtrl.getNotificationStats);

// EN: Route for marking all notifications as read (requires signin) / FR: Route pour marquer toutes les notifications comme lues (nécessite une connexion)
router.route("/mark-all-read")
  .put(authCtrl.requireSignin, notificationCtrl.markAllAsRead);

// EN: Route for clearing all notifications (requires signin) / FR: Route pour effacer toutes les notifications (nécessite une connexion)
router.route("/clear-all")
  .delete(authCtrl.requireSignin, notificationCtrl.clearAllNotifications);

// EN: Route for getting a specific notification (requires signin) / FR: Route pour récupérer une notification spécifique (nécessite une connexion)
router.route("/:notificationId")
  .get(authCtrl.requireSignin, notificationCtrl.getNotification)
  .delete(authCtrl.requireSignin, notificationCtrl.deleteNotification);

// EN: Route for marking a notification as read (requires signin) / FR: Route pour marquer une notification comme lue (nécessite une connexion)
router.route("/:notificationId/read")
  .put(authCtrl.requireSignin, notificationCtrl.markAsRead);

export default router;
