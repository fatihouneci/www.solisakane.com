/**
 * @file file.controller.js
 * @description
 * EN: This file contains the controller functions for file upload operations, primarily using Multer.
 * It handles single image uploads, lists of image uploads, and defines storage configurations for various file types (images, audio, other files).
 * FR: Ce fichier contient les fonctions du contrôleur pour les opérations de téléversement de fichiers, principalement en utilisant Multer.
 * Il gère les téléversements d'images uniques, les listes d'images, et définit les configurations de stockage pour divers types de fichiers (images, audio, autres fichiers).
 */
import multer from "multer"; // EN: Multer is a middleware for handling multipart/form-data, which is primarily used for uploading files. / FR: Multer est un middleware pour gérer les données multipart/form-data, principalement utilisé pour le téléversement de fichiers.
import path from "path"; // EN: Node.js Path module / FR: Module de chemin de Node.js
import dotenv from "dotenv"; // EN: Used for loading environment variables / FR: Utilisé pour charger les variables d'environnement
import Errors from "../helpers/Errors.js"; // EN: Custom error handling utility / FR: Utilitaire de gestion d'erreurs personnalisé
import CatchAsyncError from "../helpers/CatchAsyncError.js"; // EN: Utility to catch async errors / FR: Utilitaire pour attraper les erreurs asynchrones

import File from "../models/file.model.js"; // EN: Mongoose model for file data / FR: Modèle Mongoose pour les données de fichier

dotenv.config(); // EN: Load environment variables from .env file / FR: Charger les variables d'environnement depuis le fichier .env

const maxSize = 100 * 1024 * 1024; // EN: Max file size for general files (100MB) / FR: Taille maximale du fichier pour les fichiers généraux (100 Mo)

/**
 * EN: Handles the upload of a list of images.
 * FR: Gère le téléversement d'une liste d'images.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const updloadImageList = CatchAsyncError(async (req, res, next) => {
  let data = [];
  try {
    if (req.files) {
      console.log(req.files);
      for (let i = 0; i < req.files.length; i++) {
        const file = new File();
        file.data = req.files[i];
        file.user = req.user._id; // EN: Assuming user is attached to req / FR: Supposant que l'utilisateur est attaché à req
        file.name = req.files[i].filename;
        const response = await file.save();
        data.push(response);
      }
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(new Errors(error.message, 400));
  }
});

/**
 * EN: Handles the upload of a single image.
 * FR: Gère le téléversement d'une seule image.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const updloadSingleImage = CatchAsyncError(async (req, res, next) => {
  try {
    const file = new File();
    if (req.file.filename) {
      file.data = req.file;
      file.user = req.auth._id; // EN: Assuming user is attached to req.auth / FR: Supposant que l'utilisateur est attaché à req.auth
      file.name = req.file.filename;
    }
    const response = await file.save();
    return res.status(201).json({ success: true, data: response });
  } catch (error) {
    console.log(error);
    return next(new Errors(error.message, 400));
  }
});

// EN: Multer storage configuration for image messages
// FR: Configuration de stockage Multer pour les messages image
const imageMsgFileStorage = multer.diskStorage({
  destination: `uploads/${process.env.IMAGE_PATH}`, // EN: Destination folder for images / FR: Dossier de destination pour les images
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // EN: Generate unique filename / FR: Générer un nom de fichier unique
  },
});

// EN: Multer storage configuration for other file types
// FR: Configuration de stockage Multer pour d'autres types de fichiers
const otherFileStorage = multer.diskStorage({
  destination: `uploads/${process.env.FILE_PATH}`, // EN: Destination folder for general files / FR: Dossier de destination pour les fichiers généraux
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// EN: Multer storage configuration for audio messages
// FR: Configuration de stockage Multer pour les messages audio
const audioMsgFileStorage = multer.diskStorage({
  destination: `uploads/${process.env.AUDIO_PATH}`, // EN: Destination folder for audio files / FR: Dossier de destination pour les fichiers audio
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".mp3"); // EN: Force .mp3 extension / FR: Forcer l'extension .mp3
  },
});

/**
 * EN: Multer configuration for audio file uploads.
 * FR: Configuration Multer pour les téléversements de fichiers audio.
 */
const AudioConfig = multer({
  storage: audioMsgFileStorage,
  limits: { fileSize: 5000 * 1024 * 1024 }, // EN: 5GB limit / FR: Limite de 5 Go
}).single("track"); // EN: Expects a single file with field name 'track' / FR: Attend un seul fichier avec le nom de champ 'track'

/**
 * EN: Multer configuration for single image uploads.
 * FR: Configuration Multer pour les téléversements d'images uniques.
 */
const singleImageConfig = multer({
  storage: imageMsgFileStorage,
  limits: { fileSize: 100000000 }, // EN: 100MB limit / FR: Limite de 100 Mo
}).single("image"); // EN: Expects a single file with field name 'image' / FR: Attend un seul fichier avec le nom de champ 'image'

/**
 * EN: Multer configuration for multiple image uploads.
 * FR: Configuration Multer pour les téléversements de plusieurs images.
 */
const ImageListConfig = multer({
  storage: imageMsgFileStorage,
  limits: { fileSize: 1000000 }, // EN: 1MB limit per file / FR: Limite de 1 Mo par fichier
}).array("images"); // EN: Expects an array of files with field name 'images' / FR: Attend un tableau de fichiers avec le nom de champ 'images'

/**
 * EN: Multer configuration for other general file uploads.
 * FR: Configuration Multer pour les téléversements d'autres fichiers généraux.
 */
const OtherConfig = multer({
  storage: otherFileStorage,
  limits: { fileSize: maxSize },
}).single("file"); // EN: Expects a single file with field name 'file' / FR: Attend un seul fichier avec le nom de champ 'file'

export default {
  singleImageConfig,
  ImageListConfig,
  AudioConfig,
  OtherConfig,
  updloadSingleImage,
  updloadImageList,
};