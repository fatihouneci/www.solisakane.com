import express from "express";
import userCtrl from "../controllers/user.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

router
  .route("/")
  .get(authCtrl.requireSignin, userCtrl.list)
  .post(userCtrl.create);

router.route("/search").get(authCtrl.requireSignin, userCtrl.search);

router
  .route("/:userId")
  .get(userCtrl.read)
  .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update)
  .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove);
router
  .route("/stripe_auth/:userId")
  .put(
    authCtrl.requireSignin,
    authCtrl.hasAuthorization,
    userCtrl.stripe_auth,
    userCtrl.update
  );

router.param("userId", userCtrl.userByID);

export default router;
