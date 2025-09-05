/**
 * @file meeting.controller.js
 * @description
 * EN: This file contains the controller functions for meeting operations.
 * FR: Ce fichier contient les fonctions du contrôleur pour les opérations de réunions.
 */
import Meeting from "../models/meeting.model.js";
import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";
import Errors from "../helpers/Errors.js";
import CatchAsyncError from "../helpers/CatchAsyncError.js";
import { v4 as uuidv4 } from 'uuid';

/**
 * EN: Create a new meeting
 * FR: Créer une nouvelle réunion
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const createMeeting = CatchAsyncError(async (req, res, next) => {
  try {
    const organizerId = req.auth._id;
    const {
      title,
      description,
      participants,
      scheduledStart,
      scheduledEnd,
      type,
      location,
      agenda,
      settings,
      recurrence
    } = req.body;

    // EN: Validate required fields / FR: Valider les champs requis
    if (!title || !scheduledStart || !scheduledEnd) {
      return next(new Errors("Titre, heure de début et heure de fin sont requis", 400));
    }

    // EN: Validate date range / FR: Valider la plage de dates
    const startDate = new Date(scheduledStart);
    const endDate = new Date(scheduledEnd);
    
    if (startDate >= endDate) {
      return next(new Errors("L'heure de fin doit être après l'heure de début", 400));
    }

    if (startDate < new Date()) {
      return next(new Errors("L'heure de début ne peut pas être dans le passé", 400));
    }

    // EN: Create meeting data / FR: Créer les données de réunion
    const meetingData = {
      title,
      description,
      organizerId,
      participants: participants || [],
      scheduledStart: startDate,
      scheduledEnd: endDate,
      type: type || 'video_call',
      location: location || {},
      agenda: agenda || [],
      settings: settings || {},
      recurrence: recurrence || { isRecurring: false }
    };

    // EN: Add organizer as participant / FR: Ajouter l'organisateur comme participant
    meetingData.participants.unshift({
      userId: organizerId,
      role: 'organizer',
      status: 'accepted'
    });

    const meeting = new Meeting(meetingData);
    await meeting.save();

    // EN: Create associated chat if enabled / FR: Créer le chat associé si activé
    if (meeting.settings.allowChat !== false) {
      const chat = new Chat({
        chatName: `Réunion: ${title}`,
        isGroupChat: true,
        users: meeting.participants.map(p => p.userId),
        owner: organizerId,
        meetingId: meeting._id
      });
      await chat.save();
      
      meeting.chat = {
        chatId: chat._id,
        isEnabled: true
      };
      await meeting.save();
    }

    // EN: Populate meeting data / FR: Peupler les données de réunion
    await meeting.populate('organizerId', 'firstName lastName email profilePicture');
    await meeting.populate('participants.userId', 'firstName lastName email profilePicture');

    res.status(201).json({
      success: true,
      meeting,
      message: "Réunion créée avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get user meetings
 * FR: Récupérer les réunions de l'utilisateur
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getUserMeetings = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const {
      startDate = new Date(),
      endDate = null,
      status = null,
      limit = 20,
      skip = 0
    } = req.query;

    const meetings = await Meeting.getUserMeetings(userId, {
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      status,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    res.status(200).json({
      success: true,
      meetings,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: meetings.length === parseInt(limit)
      },
      message: "Réunions récupérées avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get upcoming meetings
 * FR: Récupérer les réunions à venir
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getUpcomingMeetings = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { hours = 24 } = req.query;

    const meetings = await Meeting.getUpcomingMeetings(userId, parseInt(hours));

    res.status(200).json({
      success: true,
      meetings,
      message: "Réunions à venir récupérées avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get a specific meeting
 * FR: Récupérer une réunion spécifique
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getMeeting = CatchAsyncError(async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const userId = req.auth._id;

    const meeting = await Meeting.findOne({
      _id: meetingId,
      $or: [
        { organizerId: userId },
        { 'participants.userId': userId }
      ]
    })
    .populate('organizerId', 'firstName lastName email profilePicture')
    .populate('participants.userId', 'firstName lastName email profilePicture')
    .populate('agenda.presenter', 'firstName lastName email profilePicture');

    if (!meeting) {
      return next(new Errors("Réunion non trouvée ou accès non autorisé", 404));
    }

    res.status(200).json({
      success: true,
      meeting,
      message: "Réunion récupérée avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Update a meeting
 * FR: Mettre à jour une réunion
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const updateMeeting = CatchAsyncError(async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const userId = req.auth._id;
    const updateData = req.body;

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return next(new Errors("Réunion non trouvée", 404));
    }

    // EN: Check if user is the organizer / FR: Vérifier si l'utilisateur est l'organisateur
    if (meeting.organizerId.toString() !== userId) {
      return next(new Errors("Seul l'organisateur peut modifier la réunion", 403));
    }

    // EN: Validate date changes / FR: Valider les changements de date
    if (updateData.scheduledStart || updateData.scheduledEnd) {
      const startDate = updateData.scheduledStart ? new Date(updateData.scheduledStart) : meeting.scheduledStart;
      const endDate = updateData.scheduledEnd ? new Date(updateData.scheduledEnd) : meeting.scheduledEnd;
      
      if (startDate >= endDate) {
        return next(new Errors("L'heure de fin doit être après l'heure de début", 400));
      }
    }

    // EN: Update meeting / FR: Mettre à jour la réunion
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        meeting[key] = updateData[key];
      }
    });

    await meeting.save();

    res.status(200).json({
      success: true,
      meeting,
      message: "Réunion mise à jour avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Delete a meeting
 * FR: Supprimer une réunion
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const deleteMeeting = CatchAsyncError(async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const userId = req.auth._id;

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return next(new Errors("Réunion non trouvée", 404));
    }

    // EN: Check if user is the organizer / FR: Vérifier si l'utilisateur est l'organisateur
    if (meeting.organizerId.toString() !== userId) {
      return next(new Errors("Seul l'organisateur peut supprimer la réunion", 403));
    }

    // EN: Delete associated chat if exists / FR: Supprimer le chat associé s'il existe
    if (meeting.chat && meeting.chat.chatId) {
      await Chat.findByIdAndDelete(meeting.chat.chatId);
    }

    await Meeting.findByIdAndDelete(meetingId);

    res.status(200).json({
      success: true,
      message: "Réunion supprimée avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Add participant to meeting
 * FR: Ajouter un participant à la réunion
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const addParticipant = CatchAsyncError(async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const userId = req.auth._id;
    const { participantId, role = 'attendee' } = req.body;

    if (!participantId) {
      return next(new Errors("ID du participant requis", 400));
    }

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return next(new Errors("Réunion non trouvée", 404));
    }

    // EN: Check if user is the organizer / FR: Vérifier si l'utilisateur est l'organisateur
    if (meeting.organizerId.toString() !== userId) {
      return next(new Errors("Seul l'organisateur peut ajouter des participants", 403));
    }

    await meeting.addParticipant(participantId, role);

    res.status(200).json({
      success: true,
      meeting,
      message: "Participant ajouté avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Remove participant from meeting
 * FR: Supprimer un participant de la réunion
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const removeParticipant = CatchAsyncError(async (req, res, next) => {
  try {
    const { meetingId, participantId } = req.params;
    const userId = req.auth._id;

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return next(new Errors("Réunion non trouvée", 404));
    }

    // EN: Check if user is the organizer or the participant themselves / FR: Vérifier si l'utilisateur est l'organisateur ou le participant lui-même
    if (meeting.organizerId.toString() !== userId && participantId !== userId) {
      return next(new Errors("Accès non autorisé", 403));
    }

    await meeting.removeParticipant(participantId);

    res.status(200).json({
      success: true,
      meeting,
      message: "Participant supprimé avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Update participant status
 * FR: Mettre à jour le statut du participant
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const updateParticipantStatus = CatchAsyncError(async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const userId = req.auth._id;
    const { status } = req.body;

    if (!status) {
      return next(new Errors("Statut requis", 400));
    }

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return next(new Errors("Réunion non trouvée", 404));
    }

    // EN: Check if user is a participant / FR: Vérifier si l'utilisateur est un participant
    const participant = meeting.participants.find(p => p.userId.toString() === userId);
    if (!participant) {
      return next(new Errors("Vous n'êtes pas un participant de cette réunion", 403));
    }

    await meeting.updateParticipantStatus(userId, status);

    res.status(200).json({
      success: true,
      meeting,
      message: "Statut du participant mis à jour avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Start a meeting
 * FR: Démarrer une réunion
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const startMeeting = CatchAsyncError(async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const userId = req.auth._id;

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return next(new Errors("Réunion non trouvée", 404));
    }

    // EN: Check if user is the organizer / FR: Vérifier si l'utilisateur est l'organisateur
    if (meeting.organizerId.toString() !== userId) {
      return next(new Errors("Seul l'organisateur peut démarrer la réunion", 403));
    }

    if (meeting.status !== 'scheduled') {
      return next(new Errors("La réunion n'est pas en statut programmé", 400));
    }

    await meeting.startMeeting();

    res.status(200).json({
      success: true,
      meeting,
      message: "Réunion démarrée avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: End a meeting
 * FR: Terminer une réunion
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const endMeeting = CatchAsyncError(async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const userId = req.auth._id;

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return next(new Errors("Réunion non trouvée", 404));
    }

    // EN: Check if user is the organizer / FR: Vérifier si l'utilisateur est l'organisateur
    if (meeting.organizerId.toString() !== userId) {
      return next(new Errors("Seul l'organisateur peut terminer la réunion", 403));
    }

    if (meeting.status !== 'in_progress') {
      return next(new Errors("La réunion n'est pas en cours", 400));
    }

    await meeting.endMeeting();

    res.status(200).json({
      success: true,
      meeting,
      message: "Réunion terminée avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get meeting statistics
 * FR: Récupérer les statistiques de réunions
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getMeetingStats = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { days = 30 } = req.query;

    const stats = await Meeting.getMeetingStats(userId, parseInt(days));

    res.status(200).json({
      success: true,
      stats,
      message: "Statistiques de réunions récupérées avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

export default {
  createMeeting,
  getUserMeetings,
  getUpcomingMeetings,
  getMeeting,
  updateMeeting,
  deleteMeeting,
  addParticipant,
  removeParticipant,
  updateParticipantStatus,
  startMeeting,
  endMeeting,
  getMeetingStats
};
