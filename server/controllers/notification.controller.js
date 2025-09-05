/**
 * @file notification.controller.js
 * @description
 * EN: This file contains the controller functions for notification operations.
 * FR: Ce fichier contient les fonctions du contrôleur pour les opérations de notifications.
 */
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import Errors from "../helpers/Errors.js";
import CatchAsyncError from "../helpers/CatchAsyncError.js";
import { v4 as uuidv4 } from 'uuid';

/**
 * EN: Get user notifications
 * FR: Récupérer les notifications utilisateur
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getNotifications = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { 
      limit = 20, 
      skip = 0, 
      unreadOnly = false, 
      type = null, 
      category = null,
      priority = null
    } = req.query;

    const notifications = await Notification.getUserNotifications(userId, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      unreadOnly: unreadOnly === 'true',
      type,
      category,
      priority
    });

    const unreadCount = await Notification.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: notifications.length === parseInt(limit)
      },
      message: "Notifications récupérées avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get a specific notification
 * FR: Récupérer une notification spécifique
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getNotification = CatchAsyncError(async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.auth._id;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId
    }).populate('data.senderId', 'firstName lastName profilePicture');

    if (!notification) {
      return next(new Errors("Notification non trouvée", 404));
    }

    res.status(200).json({
      success: true,
      notification,
      message: "Notification récupérée avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Mark notification as read
 * FR: Marquer une notification comme lue
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const markAsRead = CatchAsyncError(async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.auth._id;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return next(new Errors("Notification non trouvée", 404));
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      notification,
      message: "Notification marquée comme lue"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Mark all notifications as read
 * FR: Marquer toutes les notifications comme lues
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const markAllAsRead = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { type } = req.body;

    const result = await Notification.markAllAsRead(userId, type);

    res.status(200).json({
      success: true,
      result,
      message: "Toutes les notifications marquées comme lues"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Delete a notification
 * FR: Supprimer une notification
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const deleteNotification = CatchAsyncError(async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.auth._id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return next(new Errors("Notification non trouvée", 404));
    }

    res.status(200).json({
      success: true,
      message: "Notification supprimée avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Clear all notifications
 * FR: Effacer toutes les notifications
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const clearAllNotifications = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { type } = req.body;

    const query = { userId };
    if (type) {
      query.type = type;
    }

    const result = await Notification.deleteMany(query);

    res.status(200).json({
      success: true,
      result,
      message: "Notifications effacées avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get notification statistics
 * FR: Récupérer les statistiques de notifications
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getNotificationStats = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { days = 30 } = req.query;

    const stats = await Notification.getNotificationStats(userId, parseInt(days));

    res.status(200).json({
      success: true,
      stats,
      message: "Statistiques de notifications récupérées avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Create a notification
 * FR: Créer une notification
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const createNotification = CatchAsyncError(async (req, res, next) => {
  try {
    const { userId, type, title, message, data, scheduledFor } = req.body;

    // EN: Validate required fields / FR: Valider les champs requis
    if (!userId || !type || !title || !message) {
      return next(new Errors("userId, type, title et message sont requis", 400));
    }

    const notificationData = {
      userId,
      type,
      title,
      message,
      data: data || {},
      scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date()
    };

    const notification = await Notification.createNotification(notificationData);

    res.status(201).json({
      success: true,
      notification,
      message: "Notification créée avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Create multiple notifications
 * FR: Créer plusieurs notifications
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const createMultipleNotifications = CatchAsyncError(async (req, res, next) => {
  try {
    const { notifications } = req.body;

    if (!notifications || !Array.isArray(notifications)) {
      return next(new Errors("Tableau de notifications requis", 400));
    }

    // EN: Validate each notification / FR: Valider chaque notification
    for (const notification of notifications) {
      if (!notification.userId || !notification.type || !notification.title || !notification.message) {
        return next(new Errors("Chaque notification doit avoir userId, type, title et message", 400));
      }
    }

    const createdNotifications = await Notification.createMultipleNotifications(notifications);

    res.status(201).json({
      success: true,
      notifications: createdNotifications,
      count: createdNotifications.length,
      message: "Notifications créées avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get notification settings
 * FR: Récupérer les paramètres de notifications
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getNotificationSettings = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;

    const user = await User.findById(userId).select('notificationSettings');

    if (!user) {
      return next(new Errors("Utilisateur non trouvé", 404));
    }

    res.status(200).json({
      success: true,
      settings: user.notificationSettings,
      message: "Paramètres de notifications récupérés avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Update notification settings
 * FR: Mettre à jour les paramètres de notifications
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const updateNotificationSettings = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { notificationSettings } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return next(new Errors("Utilisateur non trouvé", 404));
    }

    // EN: Update notification settings / FR: Mettre à jour les paramètres de notifications
    user.notificationSettings = {
      ...user.notificationSettings,
      ...notificationSettings
    };

    await user.save();

    res.status(200).json({
      success: true,
      settings: user.notificationSettings,
      message: "Paramètres de notifications mis à jour avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Test notification delivery
 * FR: Tester la livraison de notification
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const testNotification = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { type = 'test', title = 'Test Notification', message = 'Ceci est une notification de test' } = req.body;

    const notificationData = {
      userId,
      type,
      title,
      message,
      data: {
        priority: 'medium',
        category: 'system'
      }
    };

    const notification = await Notification.createNotification(notificationData);

    res.status(201).json({
      success: true,
      notification,
      message: "Notification de test créée avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

export default {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationStats,
  createNotification,
  createMultipleNotifications,
  getNotificationSettings,
  updateNotificationSettings,
  testNotification
};
