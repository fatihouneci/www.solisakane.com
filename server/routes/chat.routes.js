import express from "express";
import chatCtrl from "../controllers/chat.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// Create a new chat
router.route("/")
  .post(authCtrl.requireSignin, chatCtrl.createChat)
  .get(authCtrl.requireSignin, chatCtrl.getChats);

// Chat by ID operations
router.route("/:chatId")
  .get(authCtrl.requireSignin, chatCtrl.getChatById)
  .put(authCtrl.requireSignin, chatCtrl.updateChat)
  .delete(authCtrl.requireSignin, chatCtrl.deleteChat);

// Add user to chat
router.route("/:chatId/users")
  .post(authCtrl.requireSignin, chatCtrl.addUserToChat);

// Remove user from chat
router.route("/:chatId/users/remove")
  .post(authCtrl.requireSignin, chatCtrl.removeUserFromChat);

// Leave chat
router.route("/:chatId/leave")
  .post(authCtrl.requireSignin, chatCtrl.leaveChat);

export default router;
