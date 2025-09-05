/**
 * @file callRecording.routes.js
 * @description
 * EN: This file defines the API routes for call recording operations.
 * FR: Ce fichier définit les routes API pour les opérations d'enregistrement d'appels.
 */
import express from "express";
import callRecordingService from "../services/callRecording.service.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// EN: Route for starting call recording (requires signin) / FR: Route pour démarrer l'enregistrement d'appel (nécessite une connexion)
router.route("/:callId/start")
  .post(authCtrl.requireSignin, async (req, res, next) => {
    try {
      const { callId } = req.params;
      const recordingOptions = req.body;
      const userId = req.auth._id;

      const result = await callRecordingService.startRecording(callId, recordingOptions);
      res.status(200).json({
        success: true,
        ...result,
        message: "Enregistrement démarré avec succès"
      });
    } catch (error) {
      next(error);
    }
  });

// EN: Route for stopping call recording (requires signin) / FR: Route pour arrêter l'enregistrement d'appel (nécessite une connexion)
router.route("/:callId/stop/:recordingId")
  .post(authCtrl.requireSignin, async (req, res, next) => {
    try {
      const { callId, recordingId } = req.params;
      const finalData = req.body;
      const userId = req.auth._id;

      const result = await callRecordingService.stopRecording(callId, recordingId, finalData);
      res.status(200).json({
        success: true,
        ...result,
        message: "Enregistrement arrêté avec succès"
      });
    } catch (error) {
      next(error);
    }
  });

// EN: Route for getting call recordings (requires signin) / FR: Route pour récupérer les enregistrements d'appel (nécessite une connexion)
router.route("/:callId/recordings")
  .get(authCtrl.requireSignin, async (req, res, next) => {
    try {
      const { callId } = req.params;
      const userId = req.auth._id;

      const result = await callRecordingService.getCallRecordings(callId, userId);
      res.status(200).json({
        success: true,
        ...result,
        message: "Enregistrements récupérés avec succès"
      });
    } catch (error) {
      next(error);
    }
  });

// EN: Route for downloading a recording (requires signin) / FR: Route pour télécharger un enregistrement (nécessite une connexion)
router.route("/:callId/recordings/:recordingId/download")
  .get(authCtrl.requireSignin, async (req, res, next) => {
    try {
      const { callId, recordingId } = req.params;
      const userId = req.auth._id;

      const result = await callRecordingService.downloadRecording(callId, recordingId, userId);
      
      // EN: Set headers for file download / FR: Définir les en-têtes pour le téléchargement de fichier
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      
      // EN: Stream the file / FR: Diffuser le fichier
      const fs = require('fs');
      const fileStream = fs.createReadStream(result.filePath);
      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  });

// EN: Route for deleting a recording (requires signin) / FR: Route pour supprimer un enregistrement (nécessite une connexion)
router.route("/:callId/recordings/:recordingId")
  .delete(authCtrl.requireSignin, async (req, res, next) => {
    try {
      const { callId, recordingId } = req.params;
      const userId = req.auth._id;

      const result = await callRecordingService.deleteRecording(callId, recordingId, userId);
      res.status(200).json({
        success: true,
        ...result,
        message: "Enregistrement supprimé avec succès"
      });
    } catch (error) {
      next(error);
    }
  });

// EN: Route for updating recording settings (requires signin) / FR: Route pour mettre à jour les paramètres d'enregistrement (nécessite une connexion)
router.route("/:callId/settings")
  .put(authCtrl.requireSignin, async (req, res, next) => {
    try {
      const { callId } = req.params;
      const settings = req.body;
      const userId = req.auth._id;

      const result = await callRecordingService.updateRecordingSettings(callId, settings, userId);
      res.status(200).json({
        success: true,
        ...result,
        message: "Paramètres d'enregistrement mis à jour avec succès"
      });
    } catch (error) {
      next(error);
    }
  });

// EN: Route for getting recording statistics (requires signin) / FR: Route pour récupérer les statistiques d'enregistrement (nécessite une connexion)
router.route("/stats")
  .get(authCtrl.requireSignin, async (req, res, next) => {
    try {
      const userId = req.auth._id;
      const { period } = req.query;

      const result = await callRecordingService.getRecordingStats(userId, parseInt(period) || 30);
      res.status(200).json({
        success: true,
        ...result,
        message: "Statistiques d'enregistrement récupérées avec succès"
      });
    } catch (error) {
      next(error);
    }
  });

export default router;
