import express from "express";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

router.route("/register").post(authCtrl.register);
router.route("/activation").post(authCtrl.activation);
router
  .route("/new_password")
  .post(authCtrl.requireSignin, authCtrl.newPassword);
router
  .route("/update_profile")
  .put(authCtrl.requireSignin, authCtrl.updateProfile);
router.route("/login").post(authCtrl.signin);
router.route("/me").get(authCtrl.requireSignin, authCtrl.profile);
router.route("/logout").post(authCtrl.requireSignin, authCtrl.signout);
router.route("/remove").post(authCtrl.requireSignin, authCtrl.removeAccount);
router.route("/forgot-password").post(authCtrl.forgotPassword);
router.route("/verify-account").post(authCtrl.verifyAccount);
router.route("/reset-password").post(authCtrl.resetPassword);
router
  .route("/update-token")
  .post(authCtrl.requireSignin, authCtrl.updateToken);

export default router;
