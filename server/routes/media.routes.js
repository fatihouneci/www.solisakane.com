/**
 * @file media.routes.js
 * @description
 * EN: This file defines the API routes for media management operations.
 * FR: Ce fichier définit les routes API pour les opérations de gestion des médias.
 */
import express from "express";
import mediaCtrl from "../controllers/media.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// EN: Route for uploading a single file (requires signin) / FR: Route pour téléverser un seul fichier (nécessite une connexion)
router.route("/upload")
  .post(
    authCtrl.requireSignin,
    mediaCtrl.singleFileConfig,
    mediaCtrl.uploadFile
  );

// EN: Route for uploading multiple files (requires signin) / FR: Route pour téléverser plusieurs fichiers (nécessite une connexion)
router.route("/upload-multiple")
  .post(
    authCtrl.requireSignin,
    mediaCtrl.multipleFilesConfig,
    mediaCtrl.uploadMultipleFiles
  );

// EN: Route for getting user's media gallery (requires signin) / FR: Route pour récupérer la galerie de médias de l'utilisateur (nécessite une connexion)
router.route("/gallery")
  .get(authCtrl.requireSignin, mediaCtrl.getUserMedia);

// EN: Route for searching files (requires signin) / FR: Route pour rechercher des fichiers (nécessite une connexion)
router.route("/search")
  .get(authCtrl.requireSignin, mediaCtrl.searchFiles);

// EN: Route for getting file statistics (requires signin) / FR: Route pour récupérer les statistiques de fichiers (nécessite une connexion)
router.route("/stats")
  .get(authCtrl.requireSignin, mediaCtrl.getFileStats);

// EN: Route for getting a specific file by ID (requires signin) / FR: Route pour récupérer un fichier spécifique par ID (nécessite une connexion)
router.route("/:fileId")
  .get(authCtrl.requireSignin, mediaCtrl.getFile)
  .put(authCtrl.requireSignin, mediaCtrl.updateFile)
  .delete(authCtrl.requireSignin, mediaCtrl.deleteFile);

// EN: Route for downloading a file (requires signin) / FR: Route pour télécharger un fichier (nécessite une connexion)
router.route("/:fileId/download")
  .get(authCtrl.requireSignin, mediaCtrl.downloadFile);

export default router;
