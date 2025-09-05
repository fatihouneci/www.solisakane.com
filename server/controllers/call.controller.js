/**
 * @file call.controller.js
 * @description
 * EN: This file contains the controller functions for call-related operations.
 * FR: Ce fichier contient les fonctions du contrôleur pour les opérations liées aux appels.
 */
import Call from "../models/call.model.js";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import Errors from "../helpers/Errors.js";
import CatchAsyncError from "../helpers/CatchAsyncError.js";
import { v4 as uuidv4 } from 'uuid';

/**
 * EN: Initiates a new call (audio or video).
 * FR: Initie un nouvel appel (audio ou vidéo).
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const initiateCall = CatchAsyncError(async (req, res, next) => {
  try {
    const { chatId, callType, recipientId } = req.body;
    const callerId = req.auth._id;

    // EN: Verify chat exists and user is a participant
    // FR: Vérifier que le chat existe et que l'utilisateur est participant
    const chat = await Chat.findOne({
      _id: chatId,
      users: { $in: [callerId] }
    }).populate('users', 'firstName lastName email fcmToken socketId online status');

    if (!chat) {
      return next(new Errors("Chat non trouvé ou vous n'y avez pas accès", 404));
    }

    // EN: Check if there's already an ongoing call in this chat
    // FR: Vérifier s'il y a déjà un appel en cours dans ce chat
    if (chat.ongoingCall && chat.ongoingCall.callId) {
      return next(new Errors("Un appel est déjà en cours dans ce chat", 400));
    }

    // EN: Generate unique call ID
    // FR: Générer un ID d'appel unique
    const callId = uuidv4();

    // EN: Create new call record
    // FR: Créer un nouvel enregistrement d'appel
    const callData = {
      chatId,
      callId,
      callerId,
      callType,
      status: 'initiated',
      startedAt: new Date(),
      metadata: {
        callerDevice: req.headers['user-agent'] || 'unknown'
      }
    };

    const call = new Call(callData);
    await call.save();

    // EN: Update chat with ongoing call info
    // FR: Mettre à jour le chat avec les informations d'appel en cours
    chat.ongoingCall = {
      callId: call._id,
      chatId: chat._id,
      callerId: callerId,
      cameraStatus: callType === 'video',
      microphoneStatus: true,
      startedAt: new Date()
    };
    await chat.save();

    // EN: Populate call with caller details
    // FR: Peupler l'appel avec les détails de l'appelant
    await call.populate('callerId', 'firstName lastName email profilePicture');

    res.status(201).json({
      success: true,
      call,
      chat,
      message: "Appel initié avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Answers an incoming call.
 * FR: Répond à un appel entrant.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const answerCall = CatchAsyncError(async (req, res, next) => {
  try {
    const { callId } = req.params;
    const userId = req.auth._id;

    // EN: Find the call
    // FR: Trouver l'appel
    const call = await Call.findOne({
      callId,
      status: { $in: ['initiated', 'ringing'] }
    }).populate('callerId', 'firstName lastName email profilePicture');

    if (!call) {
      return next(new Errors("Appel non trouvé ou déjà terminé", 404));
    }

    // EN: Verify user is a participant in the chat
    // FR: Vérifier que l'utilisateur est participant dans le chat
    const chat = await Chat.findOne({
      _id: call.chatId,
      users: { $in: [userId] }
    });

    if (!chat) {
      return next(new Errors("Vous n'êtes pas autorisé à répondre à cet appel", 403));
    }

    // EN: Update call status to accepted
    // FR: Mettre à jour le statut de l'appel à accepté
    await call.updateStatus('accepted');

    // EN: Populate call with updated details
    // FR: Peupler l'appel avec les détails mis à jour
    await call.populate('callerId', 'firstName lastName email profilePicture');

    res.status(200).json({
      success: true,
      call,
      message: "Appel accepté avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Declines an incoming call.
 * FR: Refuse un appel entrant.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const declineCall = CatchAsyncError(async (req, res, next) => {
  try {
    const { callId } = req.params;
    const userId = req.auth._id;

    // EN: Find the call
    // FR: Trouver l'appel
    const call = await Call.findOne({
      callId,
      status: { $in: ['initiated', 'ringing'] }
    });

    if (!call) {
      return next(new Errors("Appel non trouvé ou déjà terminé", 404));
    }

    // EN: Verify user is a participant in the chat
    // FR: Vérifier que l'utilisateur est participant dans le chat
    const chat = await Chat.findOne({
      _id: call.chatId,
      users: { $in: [userId] }
    });

    if (!chat) {
      return next(new Errors("Vous n'êtes pas autorisé à refuser cet appel", 403));
    }

    // EN: Update call status to declined
    // FR: Mettre à jour le statut de l'appel à refusé
    await call.updateStatus('declined');

    // EN: Clear ongoing call from chat
    // FR: Effacer l'appel en cours du chat
    chat.ongoingCall = undefined;
    await chat.save();

    res.status(200).json({
      success: true,
      call,
      message: "Appel refusé avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Ends an ongoing call.
 * FR: Termine un appel en cours.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const endCall = CatchAsyncError(async (req, res, next) => {
  try {
    const { callId } = req.params;
    const { endReason = 'normal' } = req.body;
    const userId = req.auth._id;

    // EN: Find the call
    // FR: Trouver l'appel
    const call = await Call.findOne({
      callId,
      status: { $in: ['accepted', 'ringing'] }
    });

    if (!call) {
      return next(new Errors("Appel non trouvé ou déjà terminé", 404));
    }

    // EN: Verify user is a participant in the chat
    // FR: Vérifier que l'utilisateur est participant dans le chat
    const chat = await Chat.findOne({
      _id: call.chatId,
      users: { $in: [userId] }
    });

    if (!chat) {
      return next(new Errors("Vous n'êtes pas autorisé à terminer cet appel", 403));
    }

    // EN: Update call status to ended
    // FR: Mettre à jour le statut de l'appel à terminé
    call.metadata.endReason = endReason;
    await call.updateStatus('ended');

    // EN: Clear ongoing call from chat
    // FR: Effacer l'appel en cours du chat
    chat.ongoingCall = undefined;
    await chat.save();

    // EN: Populate call with final details
    // FR: Peupler l'appel avec les détails finaux
    await call.populate('callerId', 'firstName lastName email profilePicture');

    res.status(200).json({
      success: true,
      call,
      message: "Appel terminé avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Gets call history for a user.
 * FR: Récupère l'historique des appels pour un utilisateur.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getCallHistory = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { page = 1, limit = 20, chatId } = req.query;

    // EN: Build query filter
    // FR: Construire le filtre de requête
    const filter = {
      $or: [
        { callerId: userId },
        { recipientId: userId }
      ]
    };

    if (chatId) {
      filter.chatId = chatId;
    }

    // EN: Calculate pagination
    // FR: Calculer la pagination
    const skip = (page - 1) * limit;

    // EN: Get call history with pagination
    // FR: Récupérer l'historique des appels avec pagination
    const calls = await Call.find(filter)
      .populate('callerId', 'firstName lastName email profilePicture')
      .populate('chatId', 'chatName isGroupChat users')
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // EN: Get total count for pagination info
    // FR: Récupérer le nombre total pour les informations de pagination
    const totalCalls = await Call.countDocuments(filter);

    res.status(200).json({
      success: true,
      calls,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCalls / limit),
        totalCalls,
        hasNextPage: page < Math.ceil(totalCalls / limit),
        hasPrevPage: page > 1
      },
      message: "Historique des appels récupéré avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Gets active calls for a user.
 * FR: Récupère les appels actifs pour un utilisateur.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getActiveCalls = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;

    // EN: Get active calls for the user
    // FR: Récupérer les appels actifs pour l'utilisateur
    const activeCalls = await Call.findActiveCallsForUser(userId)
      .populate('callerId', 'firstName lastName email profilePicture')
      .populate('chatId', 'chatName isGroupChat users');

    res.status(200).json({
      success: true,
      activeCalls,
      message: "Appels actifs récupérés avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Gets call statistics for a user.
 * FR: Récupère les statistiques d'appels pour un utilisateur.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getCallStats = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { period = 30 } = req.query;

    // EN: Get call statistics for the user
    // FR: Récupérer les statistiques d'appels pour l'utilisateur
    const stats = await Call.getCallStats(userId, parseInt(period));

    res.status(200).json({
      success: true,
      stats,
      period: parseInt(period),
      message: "Statistiques d'appels récupérées avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Updates call quality metrics.
 * FR: Met à jour les métriques de qualité d'appel.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const updateCallQuality = CatchAsyncError(async (req, res, next) => {
  try {
    const { callId } = req.params;
    const { audioScore, videoScore, networkQuality } = req.body;
    const userId = req.auth._id;

    // EN: Find the call
    // FR: Trouver l'appel
    const call = await Call.findOne({
      callId,
      status: 'accepted'
    });

    if (!call) {
      return next(new Errors("Appel actif non trouvé", 404));
    }

    // EN: Verify user is a participant in the chat
    // FR: Vérifier que l'utilisateur est participant dans le chat
    const chat = await Chat.findOne({
      _id: call.chatId,
      users: { $in: [userId] }
    });

    if (!chat) {
      return next(new Errors("Vous n'êtes pas autorisé à mettre à jour cet appel", 403));
    }

    // EN: Update quality metrics
    // FR: Mettre à jour les métriques de qualité
    if (audioScore !== undefined) call.quality.audioScore = audioScore;
    if (videoScore !== undefined) call.quality.videoScore = videoScore;
    if (networkQuality !== undefined) call.quality.networkQuality = networkQuality;

    await call.save();

    res.status(200).json({
      success: true,
      call,
      message: "Métriques de qualité mises à jour avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

export default {
  initiateCall,
  answerCall,
  declineCall,
  endCall,
  getCallHistory,
  getActiveCalls,
  getCallStats,
  updateCallQuality
};
