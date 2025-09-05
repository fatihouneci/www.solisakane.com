/**
 * @file search.routes.js
 * @description
 * EN: This file defines the API routes for global search operations.
 * FR: Ce fichier définit les routes API pour les opérations de recherche globale.
 */
import express from "express";
import searchCtrl from "../controllers/search.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// EN: Route for performing global search (requires signin) / FR: Route pour effectuer une recherche globale (nécessite une connexion)
router.route("/")
  .post(authCtrl.requireSignin, searchCtrl.globalSearch);

// EN: Route for getting search history (requires signin) / FR: Route pour récupérer l'historique de recherche (nécessite une connexion)
router.route("/history")
  .get(authCtrl.requireSignin, searchCtrl.getSearchHistory);

// EN: Route for getting search suggestions (requires signin) / FR: Route pour récupérer les suggestions de recherche (nécessite une connexion)
router.route("/suggestions")
  .get(authCtrl.requireSignin, searchCtrl.getSearchSuggestions);

// EN: Route for getting popular searches (requires signin) / FR: Route pour récupérer les recherches populaires (nécessite une connexion)
router.route("/popular")
  .get(authCtrl.requireSignin, searchCtrl.getPopularSearches);

// EN: Route for getting search analytics (requires signin) / FR: Route pour récupérer les analytics de recherche (nécessite une connexion)
router.route("/analytics")
  .get(authCtrl.requireSignin, searchCtrl.getSearchAnalytics);

// EN: Route for clearing search history (requires signin) / FR: Route pour effacer l'historique de recherche (nécessite une connexion)
router.route("/clear-history")
  .delete(authCtrl.requireSignin, searchCtrl.clearSearchHistory);

// EN: Route for saving a search (requires signin) / FR: Route pour sauvegarder une recherche (nécessite une connexion)
router.route("/:searchId/save")
  .put(authCtrl.requireSignin, searchCtrl.saveSearch);

// EN: Route for unsaving a search (requires signin) / FR: Route pour ne plus sauvegarder une recherche (nécessite une connexion)
router.route("/:searchId/unsave")
  .put(authCtrl.requireSignin, searchCtrl.unsaveSearch);

export default router;
