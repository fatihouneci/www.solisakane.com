/**
 * @file status.routes.js
 * @description
 * EN: This file defines the API routes for status/stories operations.
 * FR: Ce fichier définit les routes API pour les opérations de statuts/stories.
 */
import express from "express";
import statusCtrl from "../controllers/status.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// EN: Route for creating a new status (requires signin) / FR: Route pour créer un nouveau statut (nécessite une connexion)
router.route("/")
  .post(authCtrl.requireSignin, statusCtrl.createStatus);

// EN: Route for getting status feed (requires signin) / FR: Route pour récupérer le feed de statuts (nécessite une connexion)
router.route("/feed")
  .get(authCtrl.requireSignin, statusCtrl.getStatusFeed);

// EN: Route for getting user's own statuses (requires signin) / FR: Route pour récupérer les statuts de l'utilisateur (nécessite une connexion)
router.route("/my-statuses")
  .get(authCtrl.requireSignin, statusCtrl.getUserStatuses);

// EN: Route for searching statuses (requires signin) / FR: Route pour rechercher des statuts (nécessite une connexion)
router.route("/search")
  .get(authCtrl.requireSignin, statusCtrl.searchStatuses);

// EN: Route for getting status statistics (requires signin) / FR: Route pour récupérer les statistiques de statuts (nécessite une connexion)
router.route("/stats")
  .get(authCtrl.requireSignin, statusCtrl.getStatusStats);

// EN: Route for getting a specific status (requires signin) / FR: Route pour récupérer un statut spécifique (nécessite une connexion)
router.route("/:statusId")
  .get(authCtrl.requireSignin, statusCtrl.getStatus)
  .put(authCtrl.requireSignin, statusCtrl.updateStatus)
  .delete(authCtrl.requireSignin, statusCtrl.deleteStatus);

// EN: Route for adding reaction to a status (requires signin) / FR: Route pour ajouter une réaction à un statut (nécessite une connexion)
router.route("/:statusId/reactions")
  .post(authCtrl.requireSignin, statusCtrl.addReaction);

// EN: Route for adding comment to a status (requires signin) / FR: Route pour ajouter un commentaire à un statut (nécessite une connexion)
router.route("/:statusId/comments")
  .post(authCtrl.requireSignin, statusCtrl.addComment);

export default router;
