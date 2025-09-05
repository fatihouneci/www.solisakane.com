/**
 * @file meeting.routes.js
 * @description
 * EN: This file defines the API routes for meeting operations.
 * FR: Ce fichier définit les routes API pour les opérations de réunions.
 */
import express from "express";
import meetingCtrl from "../controllers/meeting.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// EN: Route for creating a new meeting (requires signin) / FR: Route pour créer une nouvelle réunion (nécessite une connexion)
router.route("/")
  .post(authCtrl.requireSignin, meetingCtrl.createMeeting);

// EN: Route for getting user meetings (requires signin) / FR: Route pour récupérer les réunions de l'utilisateur (nécessite une connexion)
router.route("/my-meetings")
  .get(authCtrl.requireSignin, meetingCtrl.getUserMeetings);

// EN: Route for getting upcoming meetings (requires signin) / FR: Route pour récupérer les réunions à venir (nécessite une connexion)
router.route("/upcoming")
  .get(authCtrl.requireSignin, meetingCtrl.getUpcomingMeetings);

// EN: Route for getting meeting statistics (requires signin) / FR: Route pour récupérer les statistiques de réunions (nécessite une connexion)
router.route("/stats")
  .get(authCtrl.requireSignin, meetingCtrl.getMeetingStats);

// EN: Route for getting a specific meeting (requires signin) / FR: Route pour récupérer une réunion spécifique (nécessite une connexion)
router.route("/:meetingId")
  .get(authCtrl.requireSignin, meetingCtrl.getMeeting)
  .put(authCtrl.requireSignin, meetingCtrl.updateMeeting)
  .delete(authCtrl.requireSignin, meetingCtrl.deleteMeeting);

// EN: Route for starting a meeting (requires signin) / FR: Route pour démarrer une réunion (nécessite une connexion)
router.route("/:meetingId/start")
  .post(authCtrl.requireSignin, meetingCtrl.startMeeting);

// EN: Route for ending a meeting (requires signin) / FR: Route pour terminer une réunion (nécessite une connexion)
router.route("/:meetingId/end")
  .post(authCtrl.requireSignin, meetingCtrl.endMeeting);

// EN: Route for adding a participant to a meeting (requires signin) / FR: Route pour ajouter un participant à une réunion (nécessite une connexion)
router.route("/:meetingId/participants")
  .post(authCtrl.requireSignin, meetingCtrl.addParticipant);

// EN: Route for removing a participant from a meeting (requires signin) / FR: Route pour supprimer un participant d'une réunion (nécessite une connexion)
router.route("/:meetingId/participants/:participantId")
  .delete(authCtrl.requireSignin, meetingCtrl.removeParticipant);

// EN: Route for updating participant status (requires signin) / FR: Route pour mettre à jour le statut du participant (nécessite une connexion)
router.route("/:meetingId/participant-status")
  .put(authCtrl.requireSignin, meetingCtrl.updateParticipantStatus);

export default router;
