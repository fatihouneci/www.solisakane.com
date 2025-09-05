/**
 * @file e2eTest.routes.js
 * @description
 * EN: This file defines the API routes for E2E testing operations.
 * FR: Ce fichier définit les routes API pour les opérations de tests E2E.
 */
import express from "express";
import e2eTestCtrl from "../controllers/e2eTest.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// EN: Route for complete E2E test suite (requires signin) / FR: Route pour la suite complète de tests E2E (nécessite une connexion)
router.route("/run")
  .post(authCtrl.requireSignin, e2eTestCtrl.runE2ETests);

// EN: Route for web application E2E tests (requires signin) / FR: Route pour les tests E2E de l'application web (nécessite une connexion)
router.route("/web")
  .get(authCtrl.requireSignin, e2eTestCtrl.testWebApp);

// EN: Route for mobile application E2E tests (requires signin) / FR: Route pour les tests E2E de l'application mobile (nécessite une connexion)
router.route("/mobile")
  .get(authCtrl.requireSignin, e2eTestCtrl.testMobileApp);

// EN: Route for API endpoints E2E tests (requires signin) / FR: Route pour les tests E2E des endpoints API (nécessite une connexion)
router.route("/api")
  .get(authCtrl.requireSignin, e2eTestCtrl.testAPIEndpoints);

// EN: Route for performance E2E tests (requires signin) / FR: Route pour les tests E2E de performance (nécessite une connexion)
router.route("/performance")
  .get(authCtrl.requireSignin, e2eTestCtrl.testPerformance);

// EN: Route for coverage E2E tests (requires signin) / FR: Route pour les tests E2E de couverture (nécessite une connexion)
router.route("/coverage")
  .get(authCtrl.requireSignin, e2eTestCtrl.testCoverage);

// EN: Route for E2E test summary (requires signin) / FR: Route pour le résumé des tests E2E (nécessite une connexion)
router.route("/summary")
  .get(authCtrl.requireSignin, e2eTestCtrl.getTestSummary);

// EN: Route for E2E test statistics (requires signin) / FR: Route pour les statistiques des tests E2E (nécessite une connexion)
router.route("/statistics")
  .get(authCtrl.requireSignin, e2eTestCtrl.getTestStatistics);

export default router;
