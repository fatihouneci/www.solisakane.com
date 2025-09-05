/**
 * @file file.routes.js
 * @description
 * EN: This file defines the API routes for file (image) upload operations.
 * FR: Ce fichier définit les routes API pour les opérations de téléversement de fichiers (images).
 */
import express from "express";
import dotenv from "dotenv"; // EN: Used for loading environment variables / FR: Utilisé pour charger les variables d'environnement

import authCtrl from "../controllers/auth.controller.js";
import fileController from "../controllers/file.controller.js";

dotenv.config(); // EN: Load environment variables from .env file / FR: Charger les variables d'environnement depuis le fichier .env

const router = express.Router();

// EN: Route for uploading a single image (requires signin)
// FR: Route pour le téléversement d'une seule image (nécessite une connexion)
router.post(
  "/upload-image",
  authCtrl.requireSignin,
  fileController.singleImageConfig, // EN: Middleware for single image upload configuration / FR: Middleware pour la configuration du téléversement d'une seule image
  fileController.updloadSingleImage // EN: Controller for handling single image upload / FR: Contrôleur pour gérer le téléversement d'une seule image
);

// EN: Route for uploading a list of images (requires signin)
// FR: Route pour le téléversement d'une liste d'images (nécessite une connexion)
router.post(
  "/upload-image-list",
  authCtrl.requireSignin,
  fileController.ImageListConfig, // EN: Middleware for image list upload configuration / FR: Middleware pour la configuration du téléversement d'une liste d'images
  fileController.updloadImageList // EN: Controller for handling image list upload / FR: Contrôleur pour gérer le téléversement d'une liste d'images
);

export default router;