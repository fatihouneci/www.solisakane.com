/**
 * @file socket.controller.js
 * @description
 * EN: This file contains controller functions for Socket.IO verification and monitoring operations.
 * FR: Ce fichier contient les fonctions du contrôleur pour les opérations de vérification et de monitoring Socket.IO.
 */
import SocketVerificationService from '../services/socketVerification.service.js';
import Errors from '../helpers/Errors.js';
import CatchAsyncError from '../helpers/CatchAsyncError.js';
import { io, socketService } from '../index.js';

/**
 * EN: Run complete Socket.IO verification
 * FR: Exécuter une vérification complète Socket.IO
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const verifySocketIO = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new SocketVerificationService();
    const results = await verificationService.runCompleteVerification();
    const summary = verificationService.getVerificationSummary();

    res.status(200).json({
      success: true,
      message: 'Socket.IO verification completed successfully',
      summary,
      results
    });
  } catch (error) {
    next(new Errors(`Socket.IO verification failed: ${error.message}`, 500));
  }
});

/**
 * EN: Get Socket.IO connection status
 * FR: Récupérer le statut de connexion Socket.IO
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getConnectionStatus = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new SocketVerificationService();
    const connectionStatus = await verificationService.testConnection();

    res.status(200).json({
      success: true,
      message: 'Socket.IO connection status retrieved successfully',
      connection: connectionStatus
    });
  } catch (error) {
    next(new Errors(`Failed to get Socket.IO connection status: ${error.message}`, 500));
  }
});

/**
 * EN: Get Socket.IO authentication status
 * FR: Récupérer le statut d'authentification Socket.IO
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getAuthenticationStatus = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new SocketVerificationService();
    const authStatus = await verificationService.testAuthentication();

    res.status(200).json({
      success: true,
      message: 'Socket.IO authentication status retrieved successfully',
      authentication: authStatus
    });
  } catch (error) {
    next(new Errors(`Failed to get Socket.IO authentication status: ${error.message}`, 500));
  }
});

/**
 * EN: Get Socket.IO events status
 * FR: Récupérer le statut des événements Socket.IO
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getEventsStatus = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new SocketVerificationService();
    const eventsStatus = await verificationService.testEvents();

    res.status(200).json({
      success: true,
      message: 'Socket.IO events status retrieved successfully',
      events: eventsStatus
    });
  } catch (error) {
    next(new Errors(`Failed to get Socket.IO events status: ${error.message}`, 500));
  }
});

/**
 * EN: Get Socket.IO performance status
 * FR: Récupérer le statut des performances Socket.IO
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getPerformanceStatus = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new SocketVerificationService();
    const performanceStatus = await verificationService.testPerformance();

    res.status(200).json({
      success: true,
      message: 'Socket.IO performance status retrieved successfully',
      performance: performanceStatus
    });
  } catch (error) {
    next(new Errors(`Failed to get Socket.IO performance status: ${error.message}`, 500));
  }
});

/**
 * EN: Get Socket.IO rooms status
 * FR: Récupérer le statut des salles Socket.IO
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getRoomsStatus = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new SocketVerificationService();
    const roomsStatus = await verificationService.testRooms();

    res.status(200).json({
      success: true,
      message: 'Socket.IO rooms status retrieved successfully',
      rooms: roomsStatus
    });
  } catch (error) {
    next(new Errors(`Failed to get Socket.IO rooms status: ${error.message}`, 500));
  }
});

/**
 * EN: Get Socket.IO health summary
 * FR: Récupérer le résumé de santé Socket.IO
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getHealthSummary = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new SocketVerificationService();
    
    // EN: Run quick checks / FR: Exécuter des vérifications rapides
    await verificationService.testConnection();
    await verificationService.testAuthentication();
    await verificationService.testEvents();
    await verificationService.testPerformance();
    await verificationService.testRooms();
    verificationService.generateRecommendations();

    const summary = verificationService.getVerificationSummary();

    res.status(200).json({
      success: true,
      message: 'Socket.IO health summary retrieved successfully',
      summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(new Errors(`Failed to get Socket.IO health summary: ${error.message}`, 500));
  }
});

/**
 * EN: Get connected users count
 * FR: Récupérer le nombre d'utilisateurs connectés
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getConnectedUsersCount = CatchAsyncError(async (req, res, next) => {
  try {
    const connectedCount = socketService.getConnectedUsersCount();
    const connectedUsers = socketService.getConnectedUsers();

    res.status(200).json({
      success: true,
      message: 'Connected users count retrieved successfully',
      connectedCount,
      connectedUsers: connectedUsers.map(user => ({
        userId: user.userId,
        firstName: user.user.firstName,
        lastName: user.user.lastName,
        online: user.user.online,
        status: user.user.status,
        lastSeen: user.user.lastSeen
      }))
    });
  } catch (error) {
    next(new Errors(`Failed to get connected users count: ${error.message}`, 500));
  }
});

/**
 * EN: Get Socket.IO server information
 * FR: Récupérer les informations du serveur Socket.IO
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getServerInfo = CatchAsyncError(async (req, res, next) => {
  try {
    const serverInfo = {
      engine: io.engine?.protocol || 'unknown',
      transports: io.engine?.transports || [],
      connectedSockets: io.engine?.clientsCount || 0,
      pingTimeout: io.engine?.pingTimeout || 60000,
      pingInterval: io.engine?.pingInterval || 25000,
      upgradeTimeout: io.engine?.upgradeTimeout || 10000,
      maxHttpBufferSize: io.engine?.maxHttpBufferSize || 1000000,
      allowEIO3: io.engine?.allowEIO3 || false,
      cors: io.engine?.cors || {},
      allowRequest: io.engine?.allowRequest || null
    };

    res.status(200).json({
      success: true,
      message: 'Socket.IO server information retrieved successfully',
      server: serverInfo
    });
  } catch (error) {
    next(new Errors(`Failed to get Socket.IO server information: ${error.message}`, 500));
  }
});

/**
 * EN: Send test message to all connected users
 * FR: Envoyer un message de test à tous les utilisateurs connectés
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const sendTestMessage = CatchAsyncError(async (req, res, next) => {
  try {
    const { message, event = 'test_message' } = req.body;

    if (!message) {
      return next(new Errors('Message is required', 400));
    }

    // EN: Send test message to all connected users / FR: Envoyer un message de test à tous les utilisateurs connectés
    io.emit(event, {
      message,
      timestamp: new Date(),
      type: 'test'
    });

    res.status(200).json({
      success: true,
      message: 'Test message sent successfully',
      event,
      message,
      timestamp: new Date()
    });
  } catch (error) {
    next(new Errors(`Failed to send test message: ${error.message}`, 500));
  }
});

/**
 * EN: Send test message to specific user
 * FR: Envoyer un message de test à un utilisateur spécifique
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const sendTestMessageToUser = CatchAsyncError(async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { message, event = 'test_message' } = req.body;

    if (!message) {
      return next(new Errors('Message is required', 400));
    }

    if (!userId) {
      return next(new Errors('User ID is required', 400));
    }

    // EN: Send test message to specific user / FR: Envoyer un message de test à un utilisateur spécifique
    socketService.sendToUser(userId, event, {
      message,
      timestamp: new Date(),
      type: 'test'
    });

    res.status(200).json({
      success: true,
      message: 'Test message sent to user successfully',
      userId,
      event,
      message,
      timestamp: new Date()
    });
  } catch (error) {
    next(new Errors(`Failed to send test message to user: ${error.message}`, 500));
  }
});

/**
 * EN: Send test message to specific chat
 * FR: Envoyer un message de test à un chat spécifique
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const sendTestMessageToChat = CatchAsyncError(async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { message, event = 'test_message' } = req.body;

    if (!message) {
      return next(new Errors('Message is required', 400));
    }

    if (!chatId) {
      return next(new Errors('Chat ID is required', 400));
    }

    // EN: Send test message to specific chat / FR: Envoyer un message de test à un chat spécifique
    socketService.sendToChat(chatId, event, {
      message,
      timestamp: new Date(),
      type: 'test'
    });

    res.status(200).json({
      success: true,
      message: 'Test message sent to chat successfully',
      chatId,
      event,
      message,
      timestamp: new Date()
    });
  } catch (error) {
    next(new Errors(`Failed to send test message to chat: ${error.message}`, 500));
  }
});

/**
 * EN: Get Socket.IO statistics
 * FR: Récupérer les statistiques Socket.IO
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getStatistics = CatchAsyncError(async (req, res, next) => {
  try {
    const stats = {
      connectedUsers: socketService.getConnectedUsersCount(),
      totalSockets: io.engine?.clientsCount || 0,
      engine: io.engine?.protocol || 'unknown',
      transports: io.engine?.transports || [],
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date()
    };

    res.status(200).json({
      success: true,
      message: 'Socket.IO statistics retrieved successfully',
      statistics: stats
    });
  } catch (error) {
    next(new Errors(`Failed to get Socket.IO statistics: ${error.message}`, 500));
  }
});

export default {
  verifySocketIO,
  getConnectionStatus,
  getAuthenticationStatus,
  getEventsStatus,
  getPerformanceStatus,
  getRoomsStatus,
  getHealthSummary,
  getConnectedUsersCount,
  getServerInfo,
  sendTestMessage,
  sendTestMessageToUser,
  sendTestMessageToChat,
  getStatistics
};
