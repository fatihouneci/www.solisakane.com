
/**
 * @file NotificationService.js
 * @description
 * EN: This file provides a comprehensive service for managing and sending push notifications
 * using Firebase Admin SDK, interacting with Device and User models.
 * FR: Ce fichier fournit un service complet pour la gestion et l'envoi de notifications push
 * à l'aide du SDK Firebase Admin, en interagissant avec les modèles Device et User.
 */

import mongoose from 'mongoose'; // EN: Mongoose for MongoDB object modeling / FR: Mongoose pour la modélisation d'objets MongoDB
import Device from '../models/device.model.js'; // EN: Device model for storing device tokens / FR: Modèle Device pour stocker les jetons d'appareil
import User from '../models/user.model.js'; // EN: User model / FR: Modèle User
import firebase from './firebase.js'; // EN: Firebase Admin SDK instance / FR: Instance du SDK Firebase Admin
import logger from './logger.js'; // EN: Custom logger / FR: Logger personnalisé

/**
 * EN: NotificationService Class.
 * Manages device registration, unregistration, and sending various types of push notifications.
 * FR: Classe NotificationService.
 * Gère l'enregistrement, le désenregistrement des appareils et l'envoi de divers types de notifications push.
 */
class NotificationService {
  /**
   * EN: Registers a device for push notifications.
   * If the device already exists for the user, it updates its information. Otherwise, it creates a new device entry.
   * FR: Enregistre un appareil pour les notifications push.
   * Si l'appareil existe déjà pour l'utilisateur, il met à jour ses informations. Sinon, il crée une nouvelle entrée d'appareil.
   * @param {Object} deviceData - Device information. / Informations sur l'appareil.
   * @param {string} deviceData.userId - The ID of the user associated with the device. / L'ID de l'utilisateur associé à l'appareil.
   * @param {string} deviceData.deviceId - Unique identifier for the device. / Identifiant unique de l'appareil.
   * @param {string} deviceData.deviceToken - FCM device token. / Jeton d'appareil FCM.
   * @param {string} deviceData.platform - Device platform (e.g., 'android', 'ios'). / Plateforme de l'appareil (ex: 'android', 'ios').
   * @param {string} deviceData.deviceModel - Model of the device. / Modèle de l'appareil.
   * @param {string} deviceData.systemVersion - Operating system version. / Version du système d'exploitation.
   * @param {string} deviceData.appVersion - Application version. / Version de l'application.
   * @returns {Promise<Device>} A promise that resolves with the saved or updated device object. / Une promesse qui se résout avec l'objet appareil sauvegardé ou mis à jour.
   */
  async registerDevice(deviceData) {
    try {
      const { userId, deviceId, deviceToken, platform, deviceModel, systemVersion, appVersion } = deviceData;

      // EN: Find if device already exists for this user
      // FR: Vérifier si l'appareil existe déjà pour cet utilisateur
      let device = await Device.findOne({ deviceId, userId });
      
      if (device) {
        // EN: Update existing device / FR: Mettre à jour l'appareil existant
        device.deviceToken = deviceToken;
        device.platform = platform;
        device.deviceModel = deviceModel;
        device.systemVersion = systemVersion;
        device.appVersion = appVersion;
        device.lastSeen = new Date();
      } else {
        // EN: Create new device / FR: Créer un nouvel appareil
        device = new Device({
          userId: mongoose.Types.ObjectId(userId),
          deviceId,
          deviceToken,
          platform,
          deviceModel,
          systemVersion,
          appVersion,
          lastSeen: new Date(),
        });
      }
      
      await device.save();
      logger.info(`EN: Device registered for notifications: ${deviceId} for user ${userId} / FR: Appareil enregistré pour les notifications : ${deviceId} pour l'utilisateur ${userId}`);
      return device;
    } catch (error) {
      logger.error(`EN: Error registering device: ${error.message} / FR: Erreur lors de l'enregistrement de l'appareil : ${error.message}`);
      throw error;
    }
  }

  /**
   * EN: Updates a device's token.
   * FR: Met à jour le jeton d'un appareil.
   * @param {Object} tokenData - Token information. / Informations sur le jeton.
   * @param {string} tokenData.userId - The ID of the user. / L'ID de l'utilisateur.
   * @param {string} tokenData.deviceId - Unique identifier for the device. / Identifiant unique de l'appareil.
   * @param {string} tokenData.token - The new FCM device token. / Le nouveau jeton d'appareil FCM.
   * @returns {Promise<Device>} A promise that resolves with the updated device. / Une promesse qui se résout avec l'appareil mis à jour.
   */
  async updateDeviceToken(tokenData) {
    try {
      const { userId, deviceId, token } = tokenData;
      
      const device = await Device.findOne({ deviceId });
      
      if (!device) {
        throw new Error('Device not found');
      }
      
      device.deviceToken = token;
      device.lastSeen = new Date();
      await device.save();
      
      logger.info(`EN: Device token updated: ${deviceId} / FR: Jeton d'appareil mis à jour : ${deviceId}`);
      return device;
    } catch (error) {
      logger.error(`EN: Error updating device token: ${error.message} / FR: Erreur lors de la mise à jour du jeton de l'appareil : ${error.message}`);
      throw error;
    }
  }

  /**
   * EN: Unregisters a device.
   * FR: Désenregistre un appareil.
   * @param {string} deviceId - Device identifier. / Identifiant de l'appareil.
   * @returns {Promise<object>} A promise that resolves with the unregistration result. / Une promesse qui se résout avec le résultat du désenregistrement.
   */
  async unregisterDevice(deviceId) {
    try {
      const result = await Device.deleteOne({ deviceId });
      logger.info(`EN: Device unregistered: ${deviceId} / FR: Appareil désenregistré : ${deviceId}`);
      return result;
    } catch (error) {
      logger.error(`EN: Error unregistering device: ${error.message} / FR: Erreur lors du désenregistrement de l'appareil : ${error.message}`);
      throw error;
    }
  }

  /**
   * EN: Sends a notification to a specific user across all their registered devices.
   * FR: Envoie une notification à un utilisateur spécifique sur tous ses appareils enregistrés.
   * @param {string} userId - The ID of the user to notify. / L'ID de l'utilisateur à notifier.
   * @param {Object} notification - Notification data (title, body, data, platform-specific options). / Données de notification (titre, corps, données, options spécifiques à la plateforme).
   * @returns {Promise<object>} A promise that resolves with the send results. / Une promesse qui se résout avec les résultats d'envoi.
   */
  async sendToUser(userId, notification) {
    try {
      // EN: Get all user's devices / FR: Obtenir tous les appareils de l'utilisateur
      const devices = await Device.find({ userId });
      
      if (!devices || devices.length === 0) {
        logger.warn(`EN: No devices found for user ${userId} / FR: Aucun appareil trouvé pour l'utilisateur ${userId}`);
        return { success: false, message: 'No devices registered' };
      }
      
      // EN: Send notification to each device / FR: Envoyer la notification à chaque appareil
      const sendPromises = devices.map(device => 
        this.sendToDevice(device.deviceToken, notification, device.platform)
      );
      
      const results = await Promise.all(sendPromises);
      logger.info(`EN: Notification sent to user ${userId} on ${results.length} devices / FR: Notification envoyée à l'utilisateur ${userId} sur ${results.length} appareils`);
      
      return {
        success: true,
        results,
        sentTo: devices.length
      };
    } catch (error) {
      logger.error(`EN: Error sending notification to user: ${error.message} / FR: Erreur lors de l'envoi de la notification à l'utilisateur : ${error.message}`);
      throw error;
    }
  }

  /**
   * EN: Sends a chat message notification.
   * FR: Envoie une notification de message de chat.
   * @param {string} senderId - The ID of the message sender. / L'ID de l'expéditeur du message.
   * @param {string} recipientId - The ID of the message recipient. / L'ID du destinataire du message.
   * @param {Object} messageData - Message content data. / Données du contenu du message.
   * @returns {Promise<object>} A promise that resolves with the send results. / Une promesse qui se résout avec les résultats d'envoi.
   */
  async sendChatMessageNotification(senderId, recipientId, messageData) {
    try {
      // EN: Get sender's name / FR: Obtenir le nom de l'expéditeur
      const sender = await User.findById(senderId);
      if (!sender) {
        throw new Error('Sender not found');
      }
      
      // EN: Prepare notification payload / FR: Préparer la charge utile de la notification
      const notification = {
        title: sender.fullName,
        body: messageData.content.length > 100 ? 
              `${messageData.content.substring(0, 97)}...` : 
              messageData.content,
        data: {
          type: 'message',
          messageId: messageData._id.toString(),
          senderId: senderId.toString(),
          chatId: messageData.chat._id.toString(),
          timestamp: messageData.createdAt.toString(),
        }
      };
      
      // EN: Send notification / FR: Envoyer la notification
      return await this.sendToUser(recipientId, notification);
    } catch (error) {
      logger.error(`EN: Error sending chat message notification: ${error.message} / FR: Erreur lors de l'envoi de la notification de message de chat : ${error.message}`);
      throw error;
    }
  }

  /**
   * EN: Sends a call notification to a user.
   * FR: Envoie une notification d'appel à un utilisateur.
   * @param {Object} callData - Call information. / Informations sur l'appel.
   * @param {string} callData.callerId - The ID of the caller. / L'ID de l'appelant.
   * @param {string} callData.recipientId - The ID of the call recipient. / L'ID du destinataire de l'appel.
   * @param {string} callData.chatId - The ID of the chat associated with the call. / L'ID du chat associé à l'appel.
   * @param {string} callData.callId - The ID of the call. / L'ID de l'appel.
   * @param {string} callData.callType - Type of call ('audio' or 'video'). / Type d'appel ('audio' ou 'vidéo').
   * @returns {Promise<object>} A promise that resolves with the send results. / Une promesse qui se résout avec les résultats d'envoi.
   */
  async sendCallNotification(callData) {
    try {
      const { callerId, recipientId, chatId, callId, callType } = callData;
      
      // EN: Get caller information / FR: Obtenir les informations de l'appelant
      const caller = await User.findById(callerId);
      if (!caller) {
        throw new Error('Caller not found');
      }
      
      // EN: High priority notification for calls / FR: Notification haute priorité pour les appels
      const notification = {
        title: 'Incoming Call',
        body: `${caller.fullName} is calling you`,
        data: {
          type: 'call',
          chatId: chatId.toString(),
          call_id: callId.toString(),
          caller_id: callerId.toString(),
          caller_name: caller.fullName,
          video: callType === 'video' ? 'true' : 'false',
          timestamp: new Date().toISOString(),
        },
        android: {
          priority: 'high',
          ttl: 60 * 1000, // 1 minute expiration
        },
        apns: { // EN: Apple Push Notification Service specific options / FR: Options spécifiques au service de notification push Apple
          headers: {
            'apns-priority': '10',
            'apns-expiration': `${Math.floor(Date.now() / 1000) + 60}`, // 1 minute expiration
          },
          payload: {
            aps: {
              category: 'callinvite',
              sound: 'ringtone.caf',
              contentAvailable: true,
              mutableContent: true,
            },
          },
        },
      };
      
      return await this.sendToUser(recipientId, notification);
    } catch (error) {
      logger.error(`EN: Error sending call notification: ${error.message} / FR: Erreur lors de l'envoi de la notification d'appel : ${error.message}`);
      throw error;
    }
  }

  /**
   * EN: Sends a notification to a specific device token using Firebase Cloud Messaging (FCM).
   * FR: Envoie une notification à un jeton d'appareil spécifique à l'aide de Firebase Cloud Messaging (FCM).
   * @param {string} deviceToken - FCM device token. / Jeton d'appareil FCM.
   * @param {Object} notification - Notification data (title, body, data, platform-specific options). / Données de notification (titre, corps, données, options spécifiques à la plateforme).
   * @param {string} platform - Device platform ('ios' or 'android'). / Plateforme de l'appareil ('ios' ou 'android').
   * @returns {Promise<object>} A promise that resolves with the FCM send result. / Une promesse qui se résout avec le résultat d'envoi FCM.
   */
  async sendToDevice(deviceToken, notification, platform) {
    try {
      // EN: Basic message structure for FCM / FR: Structure de message de base pour FCM
      const message = {
        token: deviceToken,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          ...notification.data,
          // EN: Ensure all data values are strings for FCM / FR: S'assurer que toutes les valeurs de données sont des chaînes pour FCM
          ...Object.entries(notification.data || {}).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {})
        },
      };
      
      // EN: Platform specific configurations / FR: Configurations spécifiques à la plateforme
      if (platform === 'android') {
        message.android = notification.android || {
          priority: 'high',
          notification: {
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            channelId: notification.data?.type === 'call' ? 'incoming-calls' : 'chat-messages',
          }
        };
      } else if (platform === 'ios') {
        message.apns = notification.apns || {
          payload: {
            aps: {
              badge: 1,
              sound: notification.data?.type === 'call' ? 'ringtone.caf' : 'default',
              contentAvailable: true,
              mutableContent: true,
            },
          },
        };
      }

      // EN: Send message through FCM / FR: Envoyer le message via FCM
      const result = await firebase.messaging().send(message);
      logger.debug(`EN: Notification sent to device ${deviceToken}: ${result} / FR: Notification envoyée à l'appareil ${deviceToken} : ${result}`);
      
      return {
        success: true,
        messageId: result
      };
    } catch (error) {
      logger.error(`EN: Error sending to device ${deviceToken}: ${error.message} / FR: Erreur lors de l'envoi à l'appareil ${deviceToken} : ${error.message}`);
      
      // EN: Check if token is invalid / FR: Vérifier si le jeton est invalide
      if (error.code === 'messaging/invalid-registration-token' || 
          error.code === 'messaging/registration-token-not-registered') {
        // EN: Remove invalid device token / FR: Supprimer le jeton d'appareil invalide
        await Device.updateOne({ deviceToken }, { $set: { isValid: false } });
        logger.warn(`EN: Marked device token as invalid: ${deviceToken} / FR: Jeton d'appareil marqué comme invalide : ${deviceToken}`);
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }
}

const notificationService = new NotificationService(); // EN: Create an instance of the NotificationService / FR: Créer une instance du NotificationService

export default notificationService;
