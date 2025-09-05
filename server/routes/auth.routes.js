/**
 * @file auth.routes.js
 * @description
 * EN: This file defines the API routes for authentication-related operations.
 * FR: Ce fichier définit les routes API pour les opérations liées à l'authentification.
 */
import express from "express";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// EN: Route for user registration / FR: Route pour l'enregistrement des utilisateurs
router.route("/register").post(authCtrl.register);
// EN: Route for account activation / FR: Route pour l'activation de compte
router.route("/activation").post(authCtrl.activation);
// EN: Route for setting a new password (requires signin) / FR: Route pour définir un nouveau mot de passe (nécessite une connexion)
router
  .route("/new_password")
  .post(authCtrl.requireSignin, authCtrl.newPassword);
// EN: Route for updating user profile (requires signin) / FR: Route pour la mise à jour du profil utilisateur (nécessite une connexion)
router
  .route("/update_profile")
  .put(authCtrl.requireSignin, authCtrl.updateProfile);
// EN: Route for user login / FR: Route pour la connexion de l'utilisateur
router.route("/login").post(authCtrl.signin);
// EN: Route for getting current user's profile (requires signin) / FR: Route pour obtenir le profil de l'utilisateur actuel (nécessite une connexion)
router.route("/me").get(authCtrl.requireSignin, authCtrl.profile);
// EN: Route for user logout (requires signin) / FR: Route pour la déconnexion de l'utilisateur (nécessite une connexion)
router.route("/logout").post(authCtrl.requireSignin, authCtrl.signout);
// EN: Route for removing user account (requires signin) / FR: Route pour la suppression du compte utilisateur (nécessite une connexion)
router.route("/remove").post(authCtrl.requireSignin, authCtrl.removeAccount);
// EN: Route for initiating forgot password process / FR: Route pour initier le processus de mot de passe oublié
router.route("/forgot-password").post(authCtrl.forgotPassword);
// EN: Route for verifying account (e.g., OTP verification) / FR: Route pour la vérification de compte (ex: vérification OTP)
router.route("/verify-account").post(authCtrl.verifyAccount);
// EN: Route for resetting password / FR: Route pour la réinitialisation du mot de passe
router.route("/reset-password").post(authCtrl.resetPassword);
// EN: Route for updating user token (requires signin) / FR: Route pour la mise à jour du token utilisateur (nécessite une connexion)
router
  .route("/update-token")
  .post(authCtrl.requireSignin, authCtrl.updateToken);

export default router;