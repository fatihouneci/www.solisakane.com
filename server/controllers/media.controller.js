/**
 * @file media.controller.js
 * @description
 * EN: This file contains the controller functions for media management operations.
 * FR: Ce fichier contient les fonctions du contrôleur pour les opérations de gestion des médias.
 */
import File from "../models/file.model.js";
import User from "../models/user.model.js";
import Errors from "../helpers/Errors.js";
import CatchAsyncError from "../helpers/CatchAsyncError.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';

/**
 * EN: Upload a single file (image, video, audio, document)
 * FR: Téléverser un seul fichier (image, vidéo, audio, document)
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const uploadFile = CatchAsyncError(async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new Errors("Aucun fichier fourni", 400));
    }

    const userId = req.auth._id;
    const { description, tags, isPublic = false } = req.body;

    // EN: Generate unique filename / FR: Générer un nom de fichier unique
    const fileExtension = path.extname(req.file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(req.file.destination, uniqueFilename);

    // EN: Rename the uploaded file / FR: Renommer le fichier téléversé
    fs.renameSync(req.file.path, filePath);

    // EN: Create file record in database / FR: Créer l'enregistrement de fichier dans la base de données
    const fileData = {
      name: uniqueFilename,
      filename: uniqueFilename,
      originalName: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      path: filePath,
      url: `${req.protocol}://${req.get('host')}/${uniqueFilename}`,
      user: userId,
      isPublic: isPublic === 'true',
      metadata: {
        description: description || '',
        tags: tags ? tags.split(',').map(tag => tag.trim()) : []
      }
    };

    const file = new File(fileData);
    await file.save();

    // EN: Populate user information / FR: Peupler les informations utilisateur
    await file.populate('user', 'firstName lastName profilePicture');

    res.status(201).json({
      success: true,
      file,
      message: "Fichier téléversé avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Upload multiple files
 * FR: Téléverser plusieurs fichiers
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const uploadMultipleFiles = CatchAsyncError(async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new Errors("Aucun fichier fourni", 400));
    }

    const userId = req.auth._id;
    const { description, tags, isPublic = false } = req.body;
    const uploadedFiles = [];

    for (const uploadedFile of req.files) {
      // EN: Generate unique filename / FR: Générer un nom de fichier unique
      const fileExtension = path.extname(uploadedFile.originalname);
      const uniqueFilename = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(uploadedFile.destination, uniqueFilename);

      // EN: Rename the uploaded file / FR: Renommer le fichier téléversé
      fs.renameSync(uploadedFile.path, filePath);

      // EN: Create file record in database / FR: Créer l'enregistrement de fichier dans la base de données
      const fileData = {
        name: uniqueFilename,
        filename: uniqueFilename,
        originalName: uploadedFile.originalname,
        type: uploadedFile.mimetype,
        size: uploadedFile.size,
        path: filePath,
        url: `${req.protocol}://${req.get('host')}/${uniqueFilename}`,
        user: userId,
        isPublic: isPublic === 'true',
        metadata: {
          description: description || '',
          tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        }
      };

      const file = new File(fileData);
      await file.save();
      await file.populate('user', 'firstName lastName profilePicture');
      
      uploadedFiles.push(file);
    }

    res.status(201).json({
      success: true,
      files: uploadedFiles,
      message: `${uploadedFiles.length} fichier(s) téléversé(s) avec succès`
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get user's media gallery
 * FR: Récupérer la galerie de médias de l'utilisateur
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getUserMedia = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { category, page = 1, limit = 20, sort = 'newest' } = req.query;

    const skip = (page - 1) * limit;
    let sortOption = { createdAt: -1 };

    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'name':
        sortOption = { originalName: 1 };
        break;
      case 'size':
        sortOption = { size: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const options = {
      category,
      limit: parseInt(limit),
      skip,
      sort: sortOption
    };

    const files = await File.findByUser(userId, options);
    const totalFiles = await File.countDocuments({ user: userId, isDeleted: false });

    res.status(200).json({
      success: true,
      files,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalFiles / limit),
        totalFiles,
        hasNextPage: page < Math.ceil(totalFiles / limit),
        hasPrevPage: page > 1
      },
      message: "Médias récupérés avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get a specific file by ID
 * FR: Récupérer un fichier spécifique par ID
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getFile = CatchAsyncError(async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const userId = req.auth._id;

    const file = await File.findOne({
      _id: fileId,
      $or: [
        { user: userId },
        { isPublic: true }
      ],
      isDeleted: false
    }).populate('user', 'firstName lastName profilePicture');

    if (!file) {
      return next(new Errors("Fichier non trouvé ou accès refusé", 404));
    }

    // EN: Update last accessed time / FR: Mettre à jour la dernière fois accédé
    file.lastAccessed = new Date();
    await file.save();

    res.status(200).json({
      success: true,
      file,
      message: "Fichier récupéré avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Download a file
 * FR: Télécharger un fichier
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const downloadFile = CatchAsyncError(async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const userId = req.auth._id;

    const file = await File.findOne({
      _id: fileId,
      $or: [
        { user: userId },
        { isPublic: true }
      ],
      isDeleted: false
    });

    if (!file) {
      return next(new Errors("Fichier non trouvé ou accès refusé", 404));
    }

    // EN: Check if file exists on disk / FR: Vérifier si le fichier existe sur le disque
    if (!fs.existsSync(file.path)) {
      return next(new Errors("Fichier non trouvé sur le serveur", 404));
    }

    // EN: Update download count and last accessed / FR: Mettre à jour le compteur de téléchargement et la dernière fois accédé
    file.downloadCount += 1;
    file.lastAccessed = new Date();
    await file.save();

    // EN: Set headers for file download / FR: Définir les en-têtes pour le téléchargement de fichier
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.type);
    res.setHeader('Content-Length', file.size);

    // EN: Stream the file / FR: Diffuser le fichier
    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(res);
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Search files
 * FR: Rechercher des fichiers
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const searchFiles = CatchAsyncError(async (req, res, next) => {
  try {
    const { q, category, page = 1, limit = 20 } = req.query;
    const userId = req.auth._id;

    if (!q) {
      return next(new Errors("Terme de recherche requis", 400));
    }

    const skip = (page - 1) * limit;
    const options = {
      userId,
      category,
      limit: parseInt(limit),
      skip
    };

    const files = await File.searchFiles(q, options);
    const totalResults = await File.countDocuments({
      user: userId,
      isDeleted: false,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { originalName: { $regex: q, $options: 'i' } },
        { 'metadata.description': { $regex: q, $options: 'i' } },
        { 'metadata.tags': { $in: [new RegExp(q, 'i')] } }
      ]
    });

    res.status(200).json({
      success: true,
      files,
      query: q,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalResults / limit),
        totalResults,
        hasNextPage: page < Math.ceil(totalResults / limit),
        hasPrevPage: page > 1
      },
      message: "Recherche terminée avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Update file metadata
 * FR: Mettre à jour les métadonnées du fichier
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const updateFile = CatchAsyncError(async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const userId = req.auth._id;
    const { description, tags, isPublic } = req.body;

    const file = await File.findOne({
      _id: fileId,
      user: userId,
      isDeleted: false
    });

    if (!file) {
      return next(new Errors("Fichier non trouvé ou accès refusé", 404));
    }

    // EN: Update file metadata / FR: Mettre à jour les métadonnées du fichier
    if (description !== undefined) {
      file.metadata.description = description;
    }
    if (tags !== undefined) {
      file.metadata.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    }
    if (isPublic !== undefined) {
      file.isPublic = isPublic;
    }

    await file.save();
    await file.populate('user', 'firstName lastName profilePicture');

    res.status(200).json({
      success: true,
      file,
      message: "Fichier mis à jour avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Delete a file
 * FR: Supprimer un fichier
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const deleteFile = CatchAsyncError(async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const userId = req.auth._id;

    const file = await File.findOne({
      _id: fileId,
      user: userId,
      isDeleted: false
    });

    if (!file) {
      return next(new Errors("Fichier non trouvé ou accès refusé", 404));
    }

    // EN: Soft delete the file / FR: Suppression logique du fichier
    file.isDeleted = true;
    await file.save();

    res.status(200).json({
      success: true,
      message: "Fichier supprimé avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get file statistics for user
 * FR: Récupérer les statistiques de fichiers pour l'utilisateur
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getFileStats = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;

    const stats = await File.getUserFileStats(userId);

    res.status(200).json({
      success: true,
      stats,
      message: "Statistiques récupérées avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

// EN: Multer storage configuration for media files / FR: Configuration de stockage Multer pour les fichiers médias
const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/media';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// EN: File filter for media uploads / FR: Filtre de fichier pour les téléversements de médias
const mediaFileFilter = (req, file, cb) => {
  // EN: Define allowed file types / FR: Définir les types de fichiers autorisés
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
    'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'text/csv'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'), false);
  }
};

// EN: Multer configuration for single file upload / FR: Configuration Multer pour le téléversement d'un seul fichier
const singleFileConfig = multer({
  storage: mediaStorage,
  fileFilter: mediaFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // EN: 100MB limit / FR: Limite de 100 Mo
}).single('file');

// EN: Multer configuration for multiple files upload / FR: Configuration Multer pour le téléversement de plusieurs fichiers
const multipleFilesConfig = multer({
  storage: mediaStorage,
  fileFilter: mediaFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // EN: 100MB limit per file / FR: Limite de 100 Mo par fichier
}).array('files', 10); // EN: Maximum 10 files / FR: Maximum 10 fichiers

export default {
  uploadFile,
  uploadMultipleFiles,
  getUserMedia,
  getFile,
  downloadFile,
  searchFiles,
  updateFile,
  deleteFile,
  getFileStats,
  singleFileConfig,
  multipleFilesConfig
};
