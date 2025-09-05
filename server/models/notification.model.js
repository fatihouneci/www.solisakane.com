/**
 * @file notification.model.js
 * @description
 * EN: This file defines the Mongoose schema and model for Notifications.
 * It stores information about user notifications, alerts, and system messages.
 * FR: Ce fichier définit le schéma et le modèle Mongoose pour les Notifications.
 * Il stocke les informations sur les notifications utilisateur, alertes et messages système.
 */
import mongoose from "mongoose"; // EN: Mongoose library / FR: Bibliothèque Mongoose

const NotificationSchema = new mongoose.Schema({
  userId: { // EN: Reference to the User who receives the notification / FR: Référence à l'utilisateur qui reçoit la notification
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: { // EN: Type of notification / FR: Type de notification
    type: String,
    enum: [
      'message', 'call', 'friend_request', 'friend_accepted', 'group_invite', 
      'group_join', 'status_like', 'status_comment', 'status_mention', 
      'meeting_reminder', 'meeting_invite', 'system', 'security', 'backup',
      'file_shared', 'call_recording', 'status_expired', 'account_activity'
    ],
    required: true
  },
  title: { // EN: Notification title / FR: Titre de la notification
    type: String,
    required: true,
    maxlength: 100
  },
  message: { // EN: Notification message / FR: Message de la notification
    type: String,
    required: true,
    maxlength: 500
  },
  data: { // EN: Additional data related to the notification / FR: Données supplémentaires liées à la notification
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat'
    },
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    callId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Call'
    },
    statusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Status'
    },
    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meeting'
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File'
    },
    actionUrl: String, // EN: URL to navigate when notification is clicked / FR: URL pour naviguer quand la notification est cliquée
    actionData: Object, // EN: Additional action data / FR: Données d'action supplémentaires
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    category: {
      type: String,
      enum: ['social', 'communication', 'system', 'security', 'reminder'],
      default: 'communication'
    }
  },
  isRead: { // EN: Whether the notification has been read / FR: Si la notification a été lue
    type: Boolean,
    default: false,
    index: true
  },
  isDelivered: { // EN: Whether the notification has been delivered / FR: Si la notification a été livrée
    type: Boolean,
    default: false
  },
  readAt: { // EN: When the notification was read / FR: Quand la notification a été lue
    type: Date
  },
  deliveredAt: { // EN: When the notification was delivered / FR: Quand la notification a été livrée
    type: Date
  },
  scheduledFor: { // EN: When to deliver the notification (for scheduled notifications) / FR: Quand livrer la notification (pour les notifications programmées)
    type: Date,
    index: true
  },
  expiresAt: { // EN: When the notification expires / FR: Quand la notification expire
    type: Date,
    default: function() {
      // EN: Default 30 days expiration / FR: Expiration par défaut de 30 jours
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    },
    index: true
  },
  deliveryAttempts: { // EN: Number of delivery attempts / FR: Nombre de tentatives de livraison
    type: Number,
    default: 0
  },
  lastDeliveryAttempt: { // EN: Last delivery attempt timestamp / FR: Horodatage de la dernière tentative de livraison
    type: Date
  },
  metadata: { // EN: Additional metadata / FR: Métadonnées supplémentaires
    source: {
      type: String,
      enum: ['app', 'web', 'system', 'api'],
      default: 'app'
    },
    deviceInfo: {
      platform: String,
      version: String,
      userAgent: String
    },
    location: {
      country: String,
      city: String,
      timezone: String
    },
    tags: [String], // EN: Tags for categorization / FR: Tags pour catégorisation
    relatedNotifications: [{ // EN: Related notification IDs / FR: IDs de notifications liées
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification'
    }]
  }
}, { 
  timestamps: true, // EN: Adds createdAt and updatedAt timestamps / FR: Ajoute les horodatages createdAt et updatedAt
  expires: 'expiresAt' // EN: TTL index for automatic deletion / FR: Index TTL pour suppression automatique
});

// EN: Indexes for better performance / FR: Index pour de meilleures performances
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ scheduledFor: 1 }, { expireAfterSeconds: 0 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// EN: Pre-save hook to set delivery timestamp / FR: Hook de pré-sauvegarde pour définir l'horodatage de livraison
NotificationSchema.pre('save', function(next) {
  if (this.isModified('isDelivered') && this.isDelivered && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

/**
 * EN: Instance method to mark notification as read
 * FR: Méthode d'instance pour marquer la notification comme lue
 * @returns {Promise<Notification>} The updated notification / La notification mise à jour
 */
NotificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  return await this.save();
};

/**
 * EN: Instance method to mark notification as delivered
 * FR: Méthode d'instance pour marquer la notification comme livrée
 * @returns {Promise<Notification>} The updated notification / La notification mise à jour
 */
NotificationSchema.methods.markAsDelivered = async function() {
  this.isDelivered = true;
  this.deliveredAt = new Date();
  return await this.save();
};

/**
 * EN: Instance method to increment delivery attempts
 * FR: Méthode d'instance pour incrémenter les tentatives de livraison
 * @returns {Promise<Notification>} The updated notification / La notification mise à jour
 */
NotificationSchema.methods.incrementDeliveryAttempts = async function() {
  this.deliveryAttempts += 1;
  this.lastDeliveryAttempt = new Date();
  return await this.save();
};

/**
 * EN: Static method to get user notifications
 * FR: Méthode statique pour récupérer les notifications utilisateur
 * @param {string} userId - The user ID / L'ID utilisateur
 * @param {object} options - Query options / Options de requête
 * @returns {Promise<Notification[]>} Array of notifications / Tableau de notifications
 */
NotificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  const {
    limit = 20,
    skip = 0,
    unreadOnly = false,
    type = null,
    category = null,
    priority = null
  } = options;

  const query = { userId };

  if (unreadOnly) {
    query.isRead = false;
  }

  if (type) {
    query.type = type;
  }

  if (category) {
    query['data.category'] = category;
  }

  if (priority) {
    query['data.priority'] = priority;
  }

  return this.find(query)
    .populate('data.senderId', 'firstName lastName profilePicture')
    .populate('data.chatId', 'chatName isGroupChat')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

/**
 * EN: Static method to get unread notification count
 * FR: Méthode statique pour récupérer le nombre de notifications non lues
 * @param {string} userId - The user ID / L'ID utilisateur
 * @returns {Promise<number>} Number of unread notifications / Nombre de notifications non lues
 */
NotificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({
    userId,
    isRead: false
  });
};

/**
 * EN: Static method to mark all notifications as read
 * FR: Méthode statique pour marquer toutes les notifications comme lues
 * @param {string} userId - The user ID / L'ID utilisateur
 * @param {string} type - Optional notification type / Type de notification optionnel
 * @returns {Promise<object>} Update result / Résultat de la mise à jour
 */
NotificationSchema.statics.markAllAsRead = async function(userId, type = null) {
  const query = { userId, isRead: false };
  if (type) {
    query.type = type;
  }

  return this.updateMany(query, {
    isRead: true,
    readAt: new Date()
  });
};

/**
 * EN: Static method to get notification statistics
 * FR: Méthode statique pour récupérer les statistiques de notifications
 * @param {string} userId - The user ID / L'ID utilisateur
 * @param {number} days - Number of days to look back / Nombre de jours à regarder en arrière
 * @returns {Promise<object>} Notification statistics / Statistiques de notifications
 */
NotificationSchema.statics.getNotificationStats = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await this.aggregate([
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
        unreadCount: {
          $sum: { $cond: ['$isRead', 0, 1] }
        }
      }
    }
  ]);

  const totalUnread = await this.countDocuments({
    userId,
    isRead: false
  });

  return {
    byType: stats,
    totalUnread,
    period: days
  };
};

/**
 * EN: Static method to create a notification
 * FR: Méthode statique pour créer une notification
 * @param {object} notificationData - Notification data / Données de notification
 * @returns {Promise<Notification>} The created notification / La notification créée
 */
NotificationSchema.statics.createNotification = async function(notificationData) {
  const notification = new this(notificationData);
  return await notification.save();
};

/**
 * EN: Static method to create multiple notifications
 * FR: Méthode statique pour créer plusieurs notifications
 * @param {Array} notificationsData - Array of notification data / Tableau de données de notifications
 * @returns {Promise<Notification[]>} Array of created notifications / Tableau de notifications créées
 */
NotificationSchema.statics.createMultipleNotifications = async function(notificationsData) {
  return await this.insertMany(notificationsData);
};

/**
 * EN: Static method to get scheduled notifications
 * FR: Méthode statique pour récupérer les notifications programmées
 * @param {Date} before - Get notifications scheduled before this date / Récupérer les notifications programmées avant cette date
 * @returns {Promise<Notification[]>} Array of scheduled notifications / Tableau de notifications programmées
 */
NotificationSchema.statics.getScheduledNotifications = async function(before = new Date()) {
  return this.find({
    scheduledFor: { $lte: before },
    isDelivered: false,
    deliveryAttempts: { $lt: 3 } // EN: Max 3 delivery attempts / FR: Max 3 tentatives de livraison
  })
  .populate('userId', 'fcmToken email')
  .sort({ scheduledFor: 1 });
};

const Notification = mongoose.model('Notification', NotificationSchema); // EN: Create the Notification model / FR: Créer le modèle Notification

export default Notification;
