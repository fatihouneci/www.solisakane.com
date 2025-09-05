/**
 * @file webrtc.routes.js
 * @description
 * EN: This file defines the API routes for WebRTC verification and monitoring operations.
 * FR: Ce fichier définit les routes API pour les opérations de vérification et de monitoring WebRTC.
 */
import express from "express";
import webrtcCtrl from "../controllers/webrtc.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// EN: Route for complete WebRTC verification (requires signin) / FR: Route pour la vérification complète WebRTC (nécessite une connexion)
router.route("/verify")
  .get(authCtrl.requireSignin, webrtcCtrl.verifyWebRTC);

// EN: Route for mediasoup status (requires signin) / FR: Route pour le statut mediasoup (nécessite une connexion)
router.route("/mediasoup")
  .get(authCtrl.requireSignin, webrtcCtrl.getMediasoupStatus);

// EN: Route for React Native WebRTC status (requires signin) / FR: Route pour le statut WebRTC React Native (nécessite une connexion)
router.route("/react-native")
  .get(authCtrl.requireSignin, webrtcCtrl.getReactNativeWebRTCStatus);

// EN: Route for web client WebRTC status (requires signin) / FR: Route pour le statut WebRTC client web (nécessite une connexion)
router.route("/web-client")
  .get(authCtrl.requireSignin, webrtcCtrl.getWebClientWebRTCStatus);

// EN: Route for WebRTC performance status (requires signin) / FR: Route pour le statut des performances WebRTC (nécessite une connexion)
router.route("/performance")
  .get(authCtrl.requireSignin, webrtcCtrl.getWebRTCPerformanceStatus);

// EN: Route for WebRTC compatibility status (requires signin) / FR: Route pour le statut de compatibilité WebRTC (nécessite une connexion)
router.route("/compatibility")
  .get(authCtrl.requireSignin, webrtcCtrl.getWebRTCCompatibilityStatus);

// EN: Route for WebRTC health summary (requires signin) / FR: Route pour le résumé de santé WebRTC (nécessite une connexion)
router.route("/health")
  .get(authCtrl.requireSignin, webrtcCtrl.getWebRTCHealthSummary);

// EN: Route for WebRTC codec information (requires signin) / FR: Route pour les informations des codecs WebRTC (nécessite une connexion)
router.route("/codecs")
  .get(authCtrl.requireSignin, webrtcCtrl.getWebRTCCodecInfo);

// EN: Route for WebRTC platform support (requires signin) / FR: Route pour le support des plateformes WebRTC (nécessite une connexion)
router.route("/platforms")
  .get(authCtrl.requireSignin, webrtcCtrl.getWebRTCPlatformSupport);

// EN: Route for WebRTC statistics (requires signin) / FR: Route pour les statistiques WebRTC (nécessite une connexion)
router.route("/statistics")
  .get(authCtrl.requireSignin, webrtcCtrl.getWebRTCStatistics);

export default router;
