/**
 * @file status.controller.js
 * @description
 * EN: This file contains the controller functions for status/stories operations.
 * FR: Ce fichier contient les fonctions du contrôleur pour les opérations de statuts/stories.
 */
import Status from "../models/status.model.js";
import User from "../models/user.model.js";
import Errors from "../helpers/Errors.js";
import CatchAsyncError from "../helpers/CatchAsyncError.js";
import { v4 as uuidv4 } from 'uuid';

/**
 * EN: Create a new status/story
 * FR: Créer un nouveau statut/story
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const createStatus = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { type, content, visibility, allowedUsers, blockedUsers, expiresAt } = req.body;

    // EN: Validate required fields / FR: Valider les champs requis
    if (!type || !content) {
      return next(new Errors("Type et contenu sont requis", 400));
    }

    // EN: Create status data / FR: Créer les données de statut
    const statusData = {
      userId,
      type,
      content,
      visibility: visibility || 'contacts',
      allowedUsers: allowedUsers || [],
      blockedUsers: blockedUsers || [],
      expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000) // EN: Default 24 hours / FR: 24 heures par défaut
    };

    const status = new Status(statusData);
    await status.save();

    // EN: Populate user information / FR: Peupler les informations utilisateur
    await status.populate('userId', 'firstName lastName profilePicture');

    res.status(201).json({
      success: true,
      status,
      message: "Statut créé avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get user's status feed
 * FR: Récupérer le feed de statuts de l'utilisateur
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getStatusFeed = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { limit = 20, skip = 0 } = req.query;

    const statuses = await Status.getFeed(userId, parseInt(limit), parseInt(skip));

    res.status(200).json({
      success: true,
      statuses,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: statuses.length === parseInt(limit)
      },
      message: "Feed de statuts récupéré avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get user's own statuses
 * FR: Récupérer les statuts de l'utilisateur
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getUserStatuses = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { limit = 20, skip = 0 } = req.query;

    const statuses = await Status.getUserStatuses(userId, parseInt(limit), parseInt(skip));

    res.status(200).json({
      success: true,
      statuses,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: statuses.length === parseInt(limit)
      },
      message: "Statuts utilisateur récupérés avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get a specific status
 * FR: Récupérer un statut spécifique
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getStatus = CatchAsyncError(async (req, res, next) => {
  try {
    const { statusId } = req.params;
    const userId = req.auth._id;

    const status = await Status.findById(statusId)
      .populate('userId', 'firstName lastName profilePicture')
      .populate('reactions.userId', 'firstName lastName')
      .populate('comments.userId', 'firstName lastName');

    if (!status) {
      return next(new Errors("Statut non trouvé", 404));
    }

    // EN: Check if user can view this status / FR: Vérifier si l'utilisateur peut voir ce statut
    if (!status.canView(userId)) {
      return next(new Errors("Accès non autorisé à ce statut", 403));
    }

    // EN: Record view / FR: Enregistrer la vue
    await status.recordView(userId);

    res.status(200).json({
      success: true,
      status,
      message: "Statut récupéré avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Update a status
 * FR: Mettre à jour un statut
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const updateStatus = CatchAsyncError(async (req, res, next) => {
  try {
    const { statusId } = req.params;
    const userId = req.auth._id;
    const updateData = req.body;

    const status = await Status.findById(statusId);

    if (!status) {
      return next(new Errors("Statut non trouvé", 404));
    }

    // EN: Check if user owns this status / FR: Vérifier si l'utilisateur possède ce statut
    if (status.userId.toString() !== userId) {
      return next(new Errors("Vous ne pouvez modifier que vos propres statuts", 403));
    }

    // EN: Update status / FR: Mettre à jour le statut
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        status[key] = updateData[key];
      }
    });

    await status.save();

    res.status(200).json({
      success: true,
      status,
      message: "Statut mis à jour avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Delete a status
 * FR: Supprimer un statut
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const deleteStatus = CatchAsyncError(async (req, res, next) => {
  try {
    const { statusId } = req.params;
    const userId = req.auth._id;

    const status = await Status.findById(statusId);

    if (!status) {
      return next(new Errors("Statut non trouvé", 404));
    }

    // EN: Check if user owns this status / FR: Vérifier si l'utilisateur possède ce statut
    if (status.userId.toString() !== userId) {
      return next(new Errors("Vous ne pouvez supprimer que vos propres statuts", 403));
    }

    await Status.findByIdAndDelete(statusId);

    res.status(200).json({
      success: true,
      message: "Statut supprimé avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Add reaction to a status
 * FR: Ajouter une réaction à un statut
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const addReaction = CatchAsyncError(async (req, res, next) => {
  try {
    const { statusId } = req.params;
    const userId = req.auth._id;
    const { reactionType } = req.body;

    if (!reactionType) {
      return next(new Errors("Type de réaction requis", 400));
    }

    const status = await Status.findById(statusId);

    if (!status) {
      return next(new Errors("Statut non trouvé", 404));
    }

    // EN: Check if user can view this status / FR: Vérifier si l'utilisateur peut voir ce statut
    if (!status.canView(userId)) {
      return next(new Errors("Accès non autorisé à ce statut", 403));
    }

    await status.addReaction(userId, reactionType);

    res.status(200).json({
      success: true,
      status,
      message: "Réaction ajoutée avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Add comment to a status
 * FR: Ajouter un commentaire à un statut
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const addComment = CatchAsyncError(async (req, res, next) => {
  try {
    const { statusId } = req.params;
    const userId = req.auth._id;
    const { text } = req.body;

    if (!text) {
      return next(new Errors("Texte du commentaire requis", 400));
    }

    const status = await Status.findById(statusId);

    if (!status) {
      return next(new Errors("Statut non trouvé", 404));
    }

    // EN: Check if user can view this status / FR: Vérifier si l'utilisateur peut voir ce statut
    if (!status.canView(userId)) {
      return next(new Errors("Accès non autorisé à ce statut", 403));
    }

    await status.addComment(userId, text);

    res.status(200).json({
      success: true,
      status,
      message: "Commentaire ajouté avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Search statuses
 * FR: Rechercher des statuts
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const searchStatuses = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { q, limit = 20 } = req.query;

    if (!q) {
      return next(new Errors("Terme de recherche requis", 400));
    }

    const statuses = await Status.searchStatuses(q, userId, parseInt(limit));

    res.status(200).json({
      success: true,
      statuses,
      query: q,
      totalResults: statuses.length,
      message: "Recherche de statuts terminée avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get status statistics
 * FR: Récupérer les statistiques de statuts
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getStatusStats = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await Status.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalViews: { $sum: { $size: '$views' } },
          totalReactions: { $sum: { $size: '$reactions' } },
          totalComments: { $sum: { $size: '$comments' } }
        }
      }
    ]);

    const totalStatuses = await Status.countDocuments({
      userId,
      createdAt: { $gte: startDate }
    });

    res.status(200).json({
      success: true,
      stats: {
        byType: stats,
        totalStatuses,
        period: parseInt(days)
      },
      message: "Statistiques de statuts récupérées avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

export default {
  createStatus,
  getStatusFeed,
  getUserStatuses,
  getStatus,
  updateStatus,
  deleteStatus,
  addReaction,
  addComment,
  searchStatuses,
  getStatusStats
};
