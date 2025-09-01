import express from "express";
import callCtrl from "../controllers/call.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// Initiate a call
router.route("/initiate")
  .post(authCtrl.requireSignin, callCtrl.initiateCall);

// Call by ID operations
router.route("/:callId/answer")
  .post(authCtrl.requireSignin, callCtrl.answerCall);

router.route("/:callId/decline")
  .post(authCtrl.requireSignin, callCtrl.declineCall);

router.route("/:callId/end")
  .post(authCtrl.requireSignin, callCtrl.endCall);

// WebRTC signaling
router.route("/:callId/ice-candidate")
  .post(authCtrl.requireSignin, callCtrl.handleIceCandidate);

router.route("/:callId/sdp")
  .post(authCtrl.requireSignin, callCtrl.handleSdpOffer);

// Call quality updates
router.route("/:callId/quality")
  .put(authCtrl.requireSignin, callCtrl.updateCallQuality);

// Call history and stats
router.route("/history")
  .get(authCtrl.requireSignin, callCtrl.getCallHistory);

router.route("/stats")
  .get(authCtrl.requireSignin, callCtrl.getCallStats);

export default router;
