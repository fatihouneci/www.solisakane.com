/**
 * @file socket.routes.js
 * @description
 * EN: This file defines the API routes for Socket.IO verification and monitoring operations.
 * FR: Ce fichier définit les routes API pour les opérations de vérification et de monitoring Socket.IO.
 */
import express from "express";
import socketCtrl from "../controllers/socket.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// EN: Route for complete Socket.IO verification (requires signin) / FR: Route pour la vérification complète Socket.IO (nécessite une connexion)
router.route("/verify")
  .get(authCtrl.requireSignin, socketCtrl.verifySocketIO);

// EN: Route for Socket.IO connection status (requires signin) / FR: Route pour le statut de connexion Socket.IO (nécessite une connexion)
router.route("/connection")
  .get(authCtrl.requireSignin, socketCtrl.getConnectionStatus);

// EN: Route for Socket.IO authentication status (requires signin) / FR: Route pour le statut d'authentification Socket.IO (nécessite une connexion)
router.route("/authentication")
  .get(authCtrl.requireSignin, socketCtrl.getAuthenticationStatus);

// EN: Route for Socket.IO events status (requires signin) / FR: Route pour le statut des événements Socket.IO (nécessite une connexion)
router.route("/events")
  .get(authCtrl.requireSignin, socketCtrl.getEventsStatus);

// EN: Route for Socket.IO performance status (requires signin) / FR: Route pour le statut des performances Socket.IO (nécessite une connexion)
router.route("/performance")
  .get(authCtrl.requireSignin, socketCtrl.getPerformanceStatus);

// EN: Route for Socket.IO rooms status (requires signin) / FR: Route pour le statut des salles Socket.IO (nécessite une connexion)
router.route("/rooms")
  .get(authCtrl.requireSignin, socketCtrl.getRoomsStatus);

// EN: Route for Socket.IO health summary (requires signin) / FR: Route pour le résumé de santé Socket.IO (nécessite une connexion)
router.route("/health")
  .get(authCtrl.requireSignin, socketCtrl.getHealthSummary);

// EN: Route for connected users count (requires signin) / FR: Route pour le nombre d'utilisateurs connectés (nécessite une connexion)
router.route("/users")
  .get(authCtrl.requireSignin, socketCtrl.getConnectedUsersCount);

// EN: Route for Socket.IO server information (requires signin) / FR: Route pour les informations du serveur Socket.IO (nécessite une connexion)
router.route("/server")
  .get(authCtrl.requireSignin, socketCtrl.getServerInfo);

// EN: Route for Socket.IO statistics (requires signin) / FR: Route pour les statistiques Socket.IO (nécessite une connexion)
router.route("/statistics")
  .get(authCtrl.requireSignin, socketCtrl.getStatistics);

// EN: Route for sending test message to all users (requires signin) / FR: Route pour envoyer un message de test à tous les utilisateurs (nécessite une connexion)
router.route("/test/message")
  .post(authCtrl.requireSignin, socketCtrl.sendTestMessage);

// EN: Route for sending test message to specific user (requires signin) / FR: Route pour envoyer un message de test à un utilisateur spécifique (nécessite une connexion)
router.route("/test/message/user/:userId")
  .post(authCtrl.requireSignin, socketCtrl.sendTestMessageToUser);

// EN: Route for sending test message to specific chat (requires signin) / FR: Route pour envoyer un message de test à un chat spécifique (nécessite une connexion)
router.route("/test/message/chat/:chatId")
  .post(authCtrl.requireSignin, socketCtrl.sendTestMessageToChat);

export default router;
