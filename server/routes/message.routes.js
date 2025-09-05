/**
 * @file message.routes.js
 * @description
 * EN: This file defines the API routes for message-related operations.
 * FR: Ce fichier définit les routes API pour les opérations liées aux messages.
 */
import express from "express";
import messageCtrl from "../controllers/message.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// EN: Route for sending a new message (requires signin) / FR: Route pour envoyer un nouveau message (nécessite une connexion)
router.route("/").post(authCtrl.requireSignin, messageCtrl.sendMessage);

// EN: Route for getting messages from a specific chat (requires signin) / FR: Route pour récupérer les messages d'un chat spécifique (nécessite une connexion)
router.route("/chat/:chatId").get(authCtrl.requireSignin, messageCtrl.getChatMessages);

// EN: Route for searching messages in a chat (requires signin) / FR: Route pour rechercher des messages dans un chat (nécessite une connexion)
router.route("/chat/:chatId/search").get(authCtrl.requireSignin, messageCtrl.searchMessages);

// EN: Route for marking messages as read in a chat (requires signin) / FR: Route pour marquer les messages comme lus dans un chat (nécessite une connexion)
router.route("/chat/:chatId/read").put(authCtrl.requireSignin, messageCtrl.markMessagesAsRead);

// EN: Route for updating a specific message (requires signin) / FR: Route pour mettre à jour un message spécifique (nécessite une connexion)
router.route("/:messageId").put(authCtrl.requireSignin, messageCtrl.updateMessage);

// EN: Route for deleting a specific message (requires signin) / FR: Route pour supprimer un message spécifique (nécessite une connexion)
router.route("/:messageId").delete(authCtrl.requireSignin, messageCtrl.deleteMessage);

// EN: Route for liking/unliking a message (requires signin) / FR: Route pour aimer/ne plus aimer un message (nécessite une connexion)
router.route("/:messageId/like").post(authCtrl.requireSignin, messageCtrl.toggleMessageLike);

export default router;
