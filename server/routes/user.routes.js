/**
 * @file user.routes.js
 * @description
 * EN: This file defines the API routes for user-related operations.
 * FR: Ce fichier définit les routes API pour les opérations liées aux utilisateurs.
 */
import express from "express";
import userCtrl from "../controllers/user.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// EN: Route for listing all users (requires signin) and creating a new user
// FR: Route pour lister tous les utilisateurs (nécessite une connexion) et créer un nouvel utilisateur
router
  .route("/")
  .get(authCtrl.requireSignin, userCtrl.list)
  .post(userCtrl.create);

// EN: Route for searching users (requires signin)
// FR: Route pour la recherche d'utilisateurs (nécessite une connexion)
router.route("/search").get(authCtrl.requireSignin, userCtrl.search);

// EN: Routes for specific user operations by ID
// FR: Routes pour les opérations utilisateur spécifiques par ID
router
  .route("/:userId")
  .get(userCtrl.read) // EN: Get user by ID / FR: Obtenir un utilisateur par ID
  .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update) // EN: Update user by ID (requires signin and authorization) / FR: Mettre à jour un utilisateur par ID (nécessite une connexion et une autorisation)
  .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove); // EN: Delete user by ID (requires signin and authorization) / FR: Supprimer un utilisateur par ID (nécessite une connexion et une autorisation)

// EN: Route for Stripe authentication for a specific user (requires signin and authorization)
// FR: Route pour l'authentification Stripe pour un utilisateur spécifique (nécessite une connexion et une autorisation)
router
  .route("/stripe_auth/:userId")
  .put(
    authCtrl.requireSignin,
    authCtrl.hasAuthorization,
    userCtrl.stripe_auth,
    userCtrl.update
  );

// EN: Middleware to load user by ID for routes with :userId parameter
// FR: Middleware pour charger l'utilisateur par ID pour les routes avec le paramètre :userId
router.param("userId", userCtrl.userByID);

export default router;