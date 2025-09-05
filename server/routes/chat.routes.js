/**
 * @file chat.routes.js
 * @description
 * EN: This file defines the API routes for chat-related operations.
 * FR: Ce fichier définit les routes API pour les opérations liées au chat.
 */
import express from "express";
import chatCtrl from "../controllers/chat.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// EN: Route for creating a new chat (requires signin) / FR: Route pour créer un nouveau chat (nécessite une connexion)
router.route("/").post(authCtrl.requireSignin, chatCtrl.createChat);

// EN: Route for getting all chats for the authenticated user (requires signin) / FR: Route pour récupérer tous les chats de l'utilisateur authentifié (nécessite une connexion)
router.route("/").get(authCtrl.requireSignin, chatCtrl.getUserChats);

// EN: Route for getting a specific chat by ID (requires signin) / FR: Route pour récupérer un chat spécifique par ID (nécessite une connexion)
router.route("/:chatId").get(authCtrl.requireSignin, chatCtrl.getChat);

// EN: Route for updating a chat (requires signin) / FR: Route pour mettre à jour un chat (nécessite une connexion)
router.route("/:chatId").put(authCtrl.requireSignin, chatCtrl.updateChat);

// EN: Route for deleting a chat (requires signin) / FR: Route pour supprimer un chat (nécessite une connexion)
router.route("/:chatId").delete(authCtrl.requireSignin, chatCtrl.deleteChat);

// EN: Route for adding a user to a group chat (requires signin) / FR: Route pour ajouter un utilisateur à un chat de groupe (nécessite une connexion)
router.route("/:chatId/users").post(authCtrl.requireSignin, chatCtrl.addUserToChat);

// EN: Route for removing a user from a group chat (requires signin) / FR: Route pour retirer un utilisateur d'un chat de groupe (nécessite une connexion)
router.route("/:chatId/users/:userId").delete(authCtrl.requireSignin, chatCtrl.removeUserFromChat);

export default router;
