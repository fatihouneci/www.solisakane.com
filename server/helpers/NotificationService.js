// server/services/notificationService.js


import mongoose from 'mongoose';
import Device from '../models/device.model.js';
import User from '../models/user.model.js';
import firebase from './firebase.js';
import logger from './logger.js';

// // Initialize Firebase Admin SDK
// const serviceAccount = require('../config/firebase-service-account.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

class NotificationService {
  /**
   * Register a device for push notifications
   * @param {Object} deviceData - Device information
   * @returns {Promise} - Saved device object
   */
  async registerDevice(deviceData) {
    try {
      const { userId, deviceId, deviceToken, platform, deviceModel, systemVersion, appVersion } = deviceData;

      // Find if device already exists for this user
      let device = await Device.findOne({ deviceId, userId });
      
      if (device) {
        // Update existing device
        device.deviceToken = deviceToken;
        device.platform = platform;
        device.deviceModel = deviceModel;
        device.systemVersion = systemVersion;
        device.appVersion = appVersion;
        device.lastSeen = new Date();
      } else {
        // Create new device
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
      logger.info(`Device registered for notifications: ${deviceId} for user ${userId}`);
      return device;
    } catch (error) {
      logger.error(`Error registering device: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update device token
   * @param {Object} tokenData - Token information
   * @returns {Promise} - Updated device
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
      
      logger.info(`Device token updated: ${deviceId}`);
      return device;
    } catch (error) {
      logger.error(`Error updating device token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Unregister a device
   * @param {string} deviceId - Device identifier
   * @returns {Promise} - Unregistration result
   */
  async unregisterDevice(deviceId) {
    try {
      const result = await Device.deleteOne({ deviceId });
      logger.info(`Device unregistered: ${deviceId}`);
      return result;
    } catch (error) {
      logger.error(`Error unregistering device: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send notification to a specific user
   * @param {string} userId - User to notify
   * @param {Object} notification - Notification data
   * @returns {Promise} - Send results
   */
  async sendToUser(userId, notification) {
    try {
      // Get all user's devices
      const devices = await Device.find({ userId });
      
      if (!devices || devices.length === 0) {
        logger.warn(`No devices found for user ${userId}`);
        return { success: false, message: 'No devices registered' };
      }
      
      const sendPromises = devices.map(device => 
        this.sendToDevice(device.deviceToken, notification, device.platform)
      );
      
      const results = await Promise.all(sendPromises);
      logger.info(`Notification sent to user ${userId} on ${results.length} devices`);
      
      return {
        success: true,
        results,
        sentTo: devices.length
      };
    } catch (error) {
      logger.error(`Error sending notification to user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send a chat message notification
   * @param {string} senderId - Message sender
   * @param {string} recipientId - Message recipient
   * @param {Object} messageData - Message content
   * @returns {Promise} - Send results
   */
  async sendChatMessageNotification(senderId, recipientId, messageData) {
    try {
      // Get sender's name
      const sender = await User.findById(senderId);
      if (!sender) {
        throw new Error('Sender not found');
      }
      
      // Prepare notification payload
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
      
      // Send notification
      return await this.sendToUser(recipientId, notification);
    } catch (error) {
      logger.error(`Error sending chat message notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send call notification to user
   * @param {Object} callData - Call information
   * @returns {Promise} - Send results
   */
  async sendCallNotification(callData) {
    try {
      const { callerId, recipientId, chatId, callId, callType } = callData;
      
      // Get caller information
      const caller = await User.findById(callerId);
      if (!caller) {
        throw new Error('Caller not found');
      }
      
      // High priority notification for calls
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
        apns: {
          headers: {
            'apns-priority': '10',
            'apns-expiration': `${Math.floor(Date.now() / 1000) + 60}`, // 1 minute expiration
          },
          payload: {
            aps: {
              category: 'callinvite',
              sound: 'ringtone.caf',
              contentAvailable: true,
            },
          },
        },
      };
      
      return await this.sendToUser(recipientId, notification);
    } catch (error) {
      logger.error(`Error sending call notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send notification to a specific device
   * @param {string} deviceToken - FCM device token
   * @param {Object} notification - Notification data
   * @param {string} platform - Device platform (ios/android)
   * @returns {Promise} - FCM send result
   */
  async sendToDevice(deviceToken, notification, platform) {
    try {
      // Basic message
      const message = {
        token: deviceToken,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          ...notification.data,
          // Ensure all values are strings for FCM
          ...Object.entries(notification.data || {}).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {})
        },
      };
      
      // Platform specific configurations
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

      
      // Send message through FCM
      const result = await firebase.messaging().send(message);
      logger.debug(`Notification sent to device ${deviceToken}: ${result}`);
      
      return {
        success: true,
        messageId: result
      };
    } catch (error) {
      logger.error(`Error sending to device ${deviceToken}: ${error.message}`);
      
      // Check if token is invalid
      if (error.code === 'messaging/invalid-registration-token' || 
          error.code === 'messaging/registration-token-not-registered') {
        // Remove invalid device token
        await Device.updateOne({ deviceToken }, { $set: { isValid: false } });
        logger.warn(`Marked device token as invalid: ${deviceToken}`);
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }
}

const notificationService = new NotificationService();

export default notificationService;