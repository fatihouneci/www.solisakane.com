/**
 * @file search.controller.js
 * @description
 * EN: This file contains the controller functions for global search operations.
 * FR: Ce fichier contient les fonctions du contrôleur pour les opérations de recherche globale.
 */
import Search from "../models/search.model.js";
import Message from "../models/message.model.js";
import File from "../models/file.model.js";
import User from "../models/user.model.js";
import Status from "../models/status.model.js";
import Meeting from "../models/meeting.model.js";
import Chat from "../models/chat.model.js";
import Errors from "../helpers/Errors.js";
import CatchAsyncError from "../helpers/CatchAsyncError.js";

/**
 * EN: Perform global search
 * FR: Effectuer une recherche globale
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const globalSearch = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { q, type = 'global', filters = {}, limit = 20, skip = 0 } = req.body;

    if (!q || q.trim().length === 0) {
      return next(new Errors("Terme de recherche requis", 400));
    }

    const startTime = Date.now();
    let results = [];
    let totalCount = 0;

    // EN: Perform search based on type / FR: Effectuer la recherche selon le type
    switch (type) {
      case 'messages':
        const messageResults = await searchMessages(userId, q, filters, limit, skip);
        results = messageResults.results;
        totalCount = messageResults.totalCount;
        break;
      
      case 'files':
        const fileResults = await searchFiles(userId, q, filters, limit, skip);
        results = fileResults.results;
        totalCount = fileResults.totalCount;
        break;
      
      case 'contacts':
        const contactResults = await searchContacts(userId, q, filters, limit, skip);
        results = contactResults.results;
        totalCount = contactResults.totalCount;
        break;
      
      case 'statuses':
        const statusResults = await searchStatuses(userId, q, filters, limit, skip);
        results = statusResults.results;
        totalCount = statusResults.totalCount;
        break;
      
      case 'meetings':
        const meetingResults = await searchMeetings(userId, q, filters, limit, skip);
        results = meetingResults.results;
        totalCount = meetingResults.totalCount;
        break;
      
      case 'chats':
        const chatResults = await searchChats(userId, q, filters, limit, skip);
        results = chatResults.results;
        totalCount = chatResults.totalCount;
        break;
      
      case 'global':
      default:
        const globalResults = await performGlobalSearch(userId, q, filters, limit, skip);
        results = globalResults.results;
        totalCount = globalResults.totalCount;
        break;
    }

    const executionTime = Date.now() - startTime;

    // EN: Create search record / FR: Créer un enregistrement de recherche
    const searchData = {
      userId,
      query: q,
      type,
      filters,
      results: {
        totalCount,
        returnedCount: results.length,
        executionTime,
        hasMore: results.length === limit
      },
      metadata: {
        source: 'app',
        deviceInfo: {
          userAgent: req.headers['user-agent']
        }
      }
    };

    await Search.createSearch(searchData);

    res.status(200).json({
      success: true,
      results,
      query: q,
      type,
      totalCount,
      returnedCount: results.length,
      executionTime,
      hasMore: results.length === limit,
      message: "Recherche effectuée avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Search messages
 * FR: Rechercher des messages
 */
const searchMessages = async (userId, query, filters, limit, skip) => {
  const searchQuery = {
    $or: [
      { content: { $regex: query, $options: 'i' } },
      { 'file.originalName': { $regex: query, $options: 'i' } }
    ],
    chat: { $in: await getUserChatIds(userId) }
  };

  // EN: Apply date filters / FR: Appliquer les filtres de date
  if (filters.dateRange) {
    searchQuery.createdAt = {
      $gte: new Date(filters.dateRange.start),
      $lte: new Date(filters.dateRange.end)
    };
  }

  const messages = await Message.find(searchQuery)
    .populate('sender', 'firstName lastName profilePicture')
    .populate('chat', 'chatName isGroupChat')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const totalCount = await Message.countDocuments(searchQuery);

  return {
    results: messages.map(msg => ({
      type: 'message',
      id: msg._id,
      content: msg.content,
      sender: msg.sender,
      chat: msg.chat,
      createdAt: msg.createdAt,
      file: msg.file
    })),
    totalCount
  };
};

/**
 * EN: Search files
 * FR: Rechercher des fichiers
 */
const searchFiles = async (userId, query, filters, limit, skip) => {
  const searchQuery = {
    $or: [
      { originalName: { $regex: query, $options: 'i' } },
      { filename: { $regex: query, $options: 'i' } },
      { 'metadata.description': { $regex: query, $options: 'i' } },
      { 'metadata.tags': { $in: [new RegExp(query, 'i')] } }
    ],
    uploadedBy: userId,
    isDeleted: false
  };

  // EN: Apply file type filters / FR: Appliquer les filtres de type de fichier
  if (filters.fileTypes && filters.fileTypes.length > 0) {
    searchQuery.type = { $in: filters.fileTypes };
  }

  const files = await File.find(searchQuery)
    .populate('uploadedBy', 'firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const totalCount = await File.countDocuments(searchQuery);

  return {
    results: files.map(file => ({
      type: 'file',
      id: file._id,
      originalName: file.originalName,
      filename: file.filename,
      type: file.type,
      size: file.size,
      uploadedBy: file.uploadedBy,
      createdAt: file.createdAt,
      url: file.url,
      thumbnail: file.thumbnail
    })),
    totalCount
  };
};

/**
 * EN: Search contacts
 * FR: Rechercher des contacts
 */
const searchContacts = async (userId, query, filters, limit, skip) => {
  const searchQuery = {
    $or: [
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ],
    _id: { $ne: userId } // EN: Exclude current user / FR: Exclure l'utilisateur actuel
  };

  const users = await User.find(searchQuery)
    .select('firstName lastName email profilePicture online status')
    .sort({ firstName: 1 })
    .limit(limit)
    .skip(skip);

  const totalCount = await User.countDocuments(searchQuery);

  return {
    results: users.map(user => ({
      type: 'contact',
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePicture: user.profilePicture,
      online: user.online,
      status: user.status
    })),
    totalCount
  };
};

/**
 * EN: Search statuses
 * FR: Rechercher des statuts
 */
const searchStatuses = async (userId, query, filters, limit, skip) => {
  const searchQuery = {
    $text: { $search: query },
    isActive: true,
    expiresAt: { $gt: new Date() },
    $or: [
      { visibility: 'public' },
      { visibility: 'contacts' },
      { allowedUsers: userId }
    ],
    blockedUsers: { $ne: userId }
  };

  // EN: Apply status type filters / FR: Appliquer les filtres de type de statut
  if (filters.statusTypes && filters.statusTypes.length > 0) {
    searchQuery.type = { $in: filters.statusTypes };
  }

  const statuses = await Status.find(searchQuery)
    .populate('userId', 'firstName lastName profilePicture')
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .skip(skip);

  const totalCount = await Status.countDocuments(searchQuery);

  return {
    results: statuses.map(status => ({
      type: 'status',
      id: status._id,
      content: status.content,
      type: status.type,
      userId: status.userId,
      createdAt: status.createdAt,
      reactions: status.reactions,
      comments: status.comments
    })),
    totalCount
  };
};

/**
 * EN: Search meetings
 * FR: Rechercher des réunions
 */
const searchMeetings = async (userId, query, filters, limit, skip) => {
  const searchQuery = {
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ],
    $or: [
      { organizerId: userId },
      { 'participants.userId': userId }
    ]
  };

  // EN: Apply meeting type filters / FR: Appliquer les filtres de type de réunion
  if (filters.meetingTypes && filters.meetingTypes.length > 0) {
    searchQuery.type = { $in: filters.meetingTypes };
  }

  const meetings = await Meeting.find(searchQuery)
    .populate('organizerId', 'firstName lastName profilePicture')
    .populate('participants.userId', 'firstName lastName profilePicture')
    .sort({ scheduledStart: -1 })
    .limit(limit)
    .skip(skip);

  const totalCount = await Meeting.countDocuments(searchQuery);

  return {
    results: meetings.map(meeting => ({
      type: 'meeting',
      id: meeting._id,
      title: meeting.title,
      description: meeting.description,
      organizerId: meeting.organizerId,
      participants: meeting.participants,
      scheduledStart: meeting.scheduledStart,
      scheduledEnd: meeting.scheduledEnd,
      status: meeting.status,
      type: meeting.type
    })),
    totalCount
  };
};

/**
 * EN: Search chats
 * FR: Rechercher des chats
 */
const searchChats = async (userId, query, filters, limit, skip) => {
  const searchQuery = {
    $or: [
      { chatName: { $regex: query, $options: 'i' } }
    ],
    users: userId
  };

  // EN: Apply chat type filters / FR: Appliquer les filtres de type de chat
  if (filters.chatTypes && filters.chatTypes.length > 0) {
    searchQuery.isGroupChat = filters.chatTypes.includes('group');
  }

  const chats = await Chat.find(searchQuery)
    .populate('users', 'firstName lastName profilePicture')
    .populate('lastMessage.sender', 'firstName lastName')
    .sort({ lastTimeMessageRead: -1 })
    .limit(limit)
    .skip(skip);

  const totalCount = await Chat.countDocuments(searchQuery);

  return {
    results: chats.map(chat => ({
      type: 'chat',
      id: chat._id,
      chatName: chat.chatName,
      isGroupChat: chat.isGroupChat,
      users: chat.users,
      lastMessage: chat.lastMessage,
      lastTimeMessageRead: chat.lastTimeMessageRead
    })),
    totalCount
  };
};

/**
 * EN: Perform global search across all types
 * FR: Effectuer une recherche globale dans tous les types
 */
const performGlobalSearch = async (userId, query, filters, limit, skip) => {
  const resultsPerType = Math.ceil(limit / 6); // EN: 6 types of content / FR: 6 types de contenu
  const skipPerType = Math.ceil(skip / 6);

  const [messages, files, contacts, statuses, meetings, chats] = await Promise.all([
    searchMessages(userId, query, filters, resultsPerType, skipPerType),
    searchFiles(userId, query, filters, resultsPerType, skipPerType),
    searchContacts(userId, query, filters, resultsPerType, skipPerType),
    searchStatuses(userId, query, filters, resultsPerType, skipPerType),
    searchMeetings(userId, query, filters, resultsPerType, skipPerType),
    searchChats(userId, query, filters, resultsPerType, skipPerType)
  ]);

  const allResults = [
    ...messages.results,
    ...files.results,
    ...contacts.results,
    ...statuses.results,
    ...meetings.results,
    ...chats.results
  ].sort((a, b) => new Date(b.createdAt || b.scheduledStart || 0) - new Date(a.createdAt || a.scheduledStart || 0));

  const totalCount = messages.totalCount + files.totalCount + contacts.totalCount + 
                    statuses.totalCount + meetings.totalCount + chats.totalCount;

  return {
    results: allResults.slice(0, limit),
    totalCount
  };
};

/**
 * EN: Get user's chat IDs
 * FR: Récupérer les IDs de chats de l'utilisateur
 */
const getUserChatIds = async (userId) => {
  const chats = await Chat.find({ users: userId }).select('_id');
  return chats.map(chat => chat._id);
};

/**
 * EN: Get search history
 * FR: Récupérer l'historique de recherche
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getSearchHistory = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { type = null, limit = 20, skip = 0, savedOnly = false } = req.query;

    const searches = await Search.getUserSearchHistory(userId, {
      type,
      limit: parseInt(limit),
      skip: parseInt(skip),
      savedOnly: savedOnly === 'true'
    });

    res.status(200).json({
      success: true,
      searches,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: searches.length === parseInt(limit)
      },
      message: "Historique de recherche récupéré avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get search suggestions
 * FR: Récupérer les suggestions de recherche
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getSearchSuggestions = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { q, type = null, limit = 5 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(200).json({
        success: true,
        suggestions: [],
        message: "Aucune suggestion disponible"
      });
    }

    const suggestions = await Search.getSearchSuggestions(userId, q, type, parseInt(limit));

    res.status(200).json({
      success: true,
      suggestions,
      query: q,
      message: "Suggestions de recherche récupérées avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get popular searches
 * FR: Récupérer les recherches populaires
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getPopularSearches = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { type = null, limit = 10, days = 30 } = req.query;

    const searches = await Search.getPopularSearches(userId, {
      type,
      limit: parseInt(limit),
      days: parseInt(days)
    });

    res.status(200).json({
      success: true,
      searches,
      message: "Recherches populaires récupérées avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Save a search
 * FR: Sauvegarder une recherche
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const saveSearch = CatchAsyncError(async (req, res, next) => {
  try {
    const { searchId } = req.params;
    const userId = req.auth._id;

    const search = await Search.findOne({
      _id: searchId,
      userId
    });

    if (!search) {
      return next(new Errors("Recherche non trouvée", 404));
    }

    await search.saveSearch();

    res.status(200).json({
      success: true,
      search,
      message: "Recherche sauvegardée avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Unsave a search
 * FR: Ne plus sauvegarder une recherche
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const unsaveSearch = CatchAsyncError(async (req, res, next) => {
  try {
    const { searchId } = req.params;
    const userId = req.auth._id;

    const search = await Search.findOne({
      _id: searchId,
      userId
    });

    if (!search) {
      return next(new Errors("Recherche non trouvée", 404));
    }

    await search.unsaveSearch();

    res.status(200).json({
      success: true,
      search,
      message: "Recherche supprimée des sauvegardes avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Clear search history
 * FR: Effacer l'historique de recherche
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const clearSearchHistory = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { type } = req.body;

    const result = await Search.clearSearchHistory(userId, type);

    res.status(200).json({
      success: true,
      result,
      message: "Historique de recherche effacé avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get search analytics
 * FR: Récupérer les analytics de recherche
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getSearchAnalytics = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { days = 30 } = req.query;

    const analytics = await Search.getSearchAnalytics(userId, parseInt(days));

    res.status(200).json({
      success: true,
      analytics,
      message: "Analytics de recherche récupérées avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

export default {
  globalSearch,
  getSearchHistory,
  getSearchSuggestions,
  getPopularSearches,
  saveSearch,
  unsaveSearch,
  clearSearchHistory,
  getSearchAnalytics
};
