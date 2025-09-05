/**
 * @file support.routes.js
 * @description
 * EN: This file defines the API routes for help and support operations.
 * FR: Ce fichier définit les routes API pour les opérations d'aide et de support.
 */
import express from "express";
import supportCtrl from "../controllers/support.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// EN: Route for getting FAQ (no authentication required) / FR: Route pour récupérer la FAQ (aucune authentification requise)
router.route("/faq")
  .get(supportCtrl.getFAQ);

// EN: Route for searching FAQ (no authentication required) / FR: Route pour rechercher dans la FAQ (aucune authentification requise)
router.route("/faq/search")
  .get(supportCtrl.searchFAQ);

// EN: Route for getting tutorials (no authentication required) / FR: Route pour récupérer les tutoriels (aucune authentification requise)
router.route("/tutorials")
  .get(supportCtrl.getTutorials);

// EN: Route for contacting support (requires signin) / FR: Route pour contacter le support (nécessite une connexion)
router.route("/contact")
  .post(authCtrl.requireSignin, supportCtrl.contactSupport);

// EN: Route for submitting support ticket (requires signin) / FR: Route pour soumettre un ticket de support (nécessite une connexion)
router.route("/tickets")
  .post(authCtrl.requireSignin, supportCtrl.submitSupportTicket)
  .get(authCtrl.requireSignin, supportCtrl.getUserSupportTickets);

export default router;
