/**
 * @file database.routes.js
 * @description
 * EN: This file defines the API routes for database verification and maintenance operations.
 * FR: Ce fichier définit les routes API pour les opérations de vérification et de maintenance de base de données.
 */
import express from "express";
import databaseCtrl from "../controllers/database.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// EN: Route for complete database verification (requires signin) / FR: Route pour la vérification complète de la base de données (nécessite une connexion)
router.route("/verify")
  .get(authCtrl.requireSignin, databaseCtrl.verifyDatabase);

// EN: Route for database connection status (requires signin) / FR: Route pour le statut de connexion à la base de données (nécessite une connexion)
router.route("/connection")
  .get(authCtrl.requireSignin, databaseCtrl.getConnectionStatus);

// EN: Route for collection statistics (requires signin) / FR: Route pour les statistiques des collections (nécessite une connexion)
router.route("/collections")
  .get(authCtrl.requireSignin, databaseCtrl.getCollectionStats);

// EN: Route for index information (requires signin) / FR: Route pour les informations d'index (nécessite une connexion)
router.route("/indexes")
  .get(authCtrl.requireSignin, databaseCtrl.getIndexInfo);

// EN: Route for data consistency check (requires signin) / FR: Route pour la vérification de cohérence des données (nécessite une connexion)
router.route("/consistency")
  .get(authCtrl.requireSignin, databaseCtrl.checkConsistency);

// EN: Route for database performance check (requires signin) / FR: Route pour la vérification des performances de la base de données (nécessite une connexion)
router.route("/performance")
  .get(authCtrl.requireSignin, databaseCtrl.checkPerformance);

// EN: Route for database health summary (requires signin) / FR: Route pour le résumé de santé de la base de données (nécessite une connexion)
router.route("/health")
  .get(authCtrl.requireSignin, databaseCtrl.getHealthSummary);

// EN: Route for database server information (requires signin) / FR: Route pour les informations du serveur de base de données (nécessite une connexion)
router.route("/server")
  .get(authCtrl.requireSignin, databaseCtrl.getServerInfo);

// EN: Route for database statistics (requires signin) / FR: Route pour les statistiques de la base de données (nécessite une connexion)
router.route("/stats")
  .get(authCtrl.requireSignin, databaseCtrl.getDatabaseStats);

// EN: Route for cleaning up orphaned data (requires signin) / FR: Route pour nettoyer les données orphelines (nécessite une connexion)
router.route("/cleanup")
  .post(authCtrl.requireSignin, databaseCtrl.cleanupOrphanedData);

// EN: Route for optimizing database indexes (requires signin) / FR: Route pour optimiser les index de base de données (nécessite une connexion)
router.route("/optimize")
  .post(authCtrl.requireSignin, databaseCtrl.optimizeIndexes);

// EN: Route for optimizing specific collection indexes (requires signin) / FR: Route pour optimiser les index d'une collection spécifique (nécessite une connexion)
router.route("/optimize/:collection")
  .post(authCtrl.requireSignin, databaseCtrl.optimizeIndexes);

export default router;
