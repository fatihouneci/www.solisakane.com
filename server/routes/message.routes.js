import express from "express";
import messageCtrl from "../controllers/message.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// Send a message
router.route("/")
  .post(authCtrl.requireSignin, messageCtrl.sendMessage);

// Get messages for a chat
router.route("/:chatId")
  .get(authCtrl.requireSignin, messageCtrl.getMessages);

// Message by ID operations
router.route("/message/:messageId")
  .get(authCtrl.requireSignin, messageCtrl.getMessageById)
  .put(authCtrl.requireSignin, messageCtrl.updateMessage)
  .delete(authCtrl.requireSignin, messageCtrl.deleteMessage);

// Message reactions
router.route("/message/:messageId/react")
  .post(authCtrl.requireSignin, messageCtrl.addReaction)
  .delete(authCtrl.requireSignin, messageCtrl.removeReaction);

// Mark messages as read
router.route("/:chatId/read")
  .post(authCtrl.requireSignin, messageCtrl.markAsRead);

export default router;
