/**
 * @file call.routes.js
 * @description
 * EN: This file defines the API routes for call-related operations.
 * FR: Ce fichier définit les routes API pour les opérations liées aux appels.
 */
import express from "express";
import callCtrl from "../controllers/call.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// EN: Route for initiating a new call (requires signin) / FR: Route pour initier un nouvel appel (nécessite une connexion)
router.route("/initiate").post(authCtrl.requireSignin, callCtrl.initiateCall);

// EN: Route for answering a call (requires signin) / FR: Route pour répondre à un appel (nécessite une connexion)
router.route("/:callId/answer").post(authCtrl.requireSignin, callCtrl.answerCall);

// EN: Route for declining a call (requires signin) / FR: Route pour refuser un appel (nécessite une connexion)
router.route("/:callId/decline").post(authCtrl.requireSignin, callCtrl.declineCall);

// EN: Route for ending a call (requires signin) / FR: Route pour terminer un appel (nécessite une connexion)
router.route("/:callId/end").post(authCtrl.requireSignin, callCtrl.endCall);

// EN: Route for updating call quality metrics (requires signin) / FR: Route pour mettre à jour les métriques de qualité d'appel (nécessite une connexion)
router.route("/:callId/quality").put(authCtrl.requireSignin, callCtrl.updateCallQuality);

// EN: Route for getting call history (requires signin) / FR: Route pour récupérer l'historique des appels (nécessite une connexion)
router.route("/history").get(authCtrl.requireSignin, callCtrl.getCallHistory);

// EN: Route for getting active calls (requires signin) / FR: Route pour récupérer les appels actifs (nécessite une connexion)
router.route("/active").get(authCtrl.requireSignin, callCtrl.getActiveCalls);

// EN: Route for getting call statistics (requires signin) / FR: Route pour récupérer les statistiques d'appels (nécessite une connexion)
router.route("/stats").get(authCtrl.requireSignin, callCtrl.getCallStats);

export default router;
