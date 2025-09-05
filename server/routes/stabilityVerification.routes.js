/**
 * @file stabilityVerification.routes.js
 * @description
 * EN: This file defines the API routes for stability verification operations.
 * FR: Ce fichier définit les routes API pour les opérations de vérification de stabilité.
 */
import express from "express";
import stabilityVerificationCtrl from "../controllers/stabilityVerification.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// EN: Route for complete stability verification (requires signin) / FR: Route pour la vérification complète de stabilité (nécessite une connexion)
router.route("/run")
  .post(authCtrl.requireSignin, stabilityVerificationCtrl.runStabilityVerification);

// EN: Route for backend stability verification (requires signin) / FR: Route pour la vérification de stabilité du backend (nécessite une connexion)
router.route("/backend")
  .get(authCtrl.requireSignin, stabilityVerificationCtrl.verifyBackendStability);

// EN: Route for web stability verification (requires signin) / FR: Route pour la vérification de stabilité web (nécessite une connexion)
router.route("/web")
  .get(authCtrl.requireSignin, stabilityVerificationCtrl.verifyWebStability);

// EN: Route for mobile stability verification (requires signin) / FR: Route pour la vérification de stabilité mobile (nécessite une connexion)
router.route("/mobile")
  .get(authCtrl.requireSignin, stabilityVerificationCtrl.verifyMobileStability);

// EN: Route for database stability verification (requires signin) / FR: Route pour la vérification de stabilité de la base de données (nécessite une connexion)
router.route("/database")
  .get(authCtrl.requireSignin, stabilityVerificationCtrl.verifyDatabaseStability);

// EN: Route for Socket.IO stability verification (requires signin) / FR: Route pour la vérification de stabilité Socket.IO (nécessite une connexion)
router.route("/socketio")
  .get(authCtrl.requireSignin, stabilityVerificationCtrl.verifySocketIOStability);

// EN: Route for WebRTC stability verification (requires signin) / FR: Route pour la vérification de stabilité WebRTC (nécessite une connexion)
router.route("/webrtc")
  .get(authCtrl.requireSignin, stabilityVerificationCtrl.verifyWebRTCStability);

// EN: Route for performance verification (requires signin) / FR: Route pour la vérification de performance (nécessite une connexion)
router.route("/performance")
  .get(authCtrl.requireSignin, stabilityVerificationCtrl.verifyPerformance);

// EN: Route for stability verification summary (requires signin) / FR: Route pour le résumé de vérification de stabilité (nécessite une connexion)
router.route("/summary")
  .get(authCtrl.requireSignin, stabilityVerificationCtrl.getStabilitySummary);

// EN: Route for stability verification statistics (requires signin) / FR: Route pour les statistiques de vérification de stabilité (nécessite une connexion)
router.route("/statistics")
  .get(authCtrl.requireSignin, stabilityVerificationCtrl.getStabilityStatistics);

export default router;
