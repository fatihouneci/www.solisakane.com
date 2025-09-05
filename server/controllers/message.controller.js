/**
 * @file message.controller.js
 * @description
 * EN: This file contains the controller functions for message-related operations.
 * FR: Ce fichier contient les fonctions du contrôleur pour les opérations liées aux messages.
 */
import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import Errors from "../helpers/Errors.js";
import CatchAsyncError from "../helpers/CatchAsyncError.js";

/**
 * EN: Sends a new message to a chat.
 * FR: Envoie un nouveau message à un chat.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const sendMessage = CatchAsyncError(async (req, res, next) => {
  try {
    const { chatId, content, type = 'text', replyTo, file } = req.body;
    const senderId = req.auth._id;

    // EN: Verify chat exists and user is a participant
    // FR: Vérifier que le chat existe et que l'utilisateur est participant
    const chat = await Chat.findOne({
      _id: chatId,
      users: { $in: [senderId] }
    });

    if (!chat) {
      return next(new Errors("Chat non trouvé ou vous n'y avez pas accès", 404));
    }

    // EN: Create new message
    // FR: Créer un nouveau message
    const messageData = {
      chat: chatId,
      content,
      type,
      sender: senderId
    };

    if (replyTo) {
      messageData.replyTo = replyTo;
    }

    if (file) {
      messageData.file = file;
    }

    const message = new Message(messageData);
    await message.save();

    // EN: Update chat's last message
    // FR: Mettre à jour le dernier message du chat
    chat.lastMessage = message._id;
    chat.lastTimeMessageRead = new Date();
    await chat.save();

    // EN: Populate message with sender details
    // FR: Peupler le message avec les détails de l'expéditeur
    await message.populate('sender', 'firstName lastName email profilePicture');
    await message.populate('replyTo.message');
    await message.populate('replyTo.user', 'firstName lastName');
    await message.populate('file');

    res.status(201).json({
      success: true,
      message,
      message: "Message envoyé avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Gets all messages for a specific chat.
 * FR: Récupère tous les messages pour un chat spécifique.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getChatMessages = CatchAsyncError(async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.auth._id;

    // EN: Verify chat exists and user is a participant
    // FR: Vérifier que le chat existe et que l'utilisateur est participant
    const chat = await Chat.findOne({
      _id: chatId,
      users: { $in: [userId] }
    });

    if (!chat) {
      return next(new Errors("Chat non trouvé ou vous n'y avez pas accès", 404));
    }

    // EN: Calculate pagination
    // FR: Calculer la pagination
    const skip = (page - 1) * limit;

    // EN: Get messages with pagination
    // FR: Récupérer les messages avec pagination
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'firstName lastName email profilePicture')
      .populate('replyTo.message')
      .populate('replyTo.user', 'firstName lastName')
      .populate('file')
      .populate('likes', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // EN: Get total count for pagination info
    // FR: Récupérer le nombre total pour les informations de pagination
    const totalMessages = await Message.countDocuments({ chat: chatId });

    res.status(200).json({
      success: true,
      messages: messages.reverse(), // EN: Reverse to show oldest first / FR: Inverser pour afficher les plus anciens en premier
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasNextPage: page < Math.ceil(totalMessages / limit),
        hasPrevPage: page > 1
      },
      message: "Messages récupérés avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Updates a message (e.g., edit content).
 * FR: Met à jour un message (ex: modifier le contenu).
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const updateMessage = CatchAsyncError(async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.auth._id;

    // EN: Find message and verify user is the sender
    // FR: Trouver le message et vérifier que l'utilisateur est l'expéditeur
    const message = await Message.findOne({
      _id: messageId,
      sender: userId
    });

    if (!message) {
      return next(new Errors("Message non trouvé ou vous n'êtes pas autorisé à le modifier", 404));
    }

    // EN: Update message content
    // FR: Mettre à jour le contenu du message
    message.content = content;
    message.updatedAt = new Date();
    await message.save();

    // EN: Populate message with sender details
    // FR: Peupler le message avec les détails de l'expéditeur
    await message.populate('sender', 'firstName lastName email profilePicture');
    await message.populate('replyTo.message');
    await message.populate('replyTo.user', 'firstName lastName');
    await message.populate('file');
    await message.populate('likes', 'firstName lastName');

    res.status(200).json({
      success: true,
      message,
      message: "Message mis à jour avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Deletes a message.
 * FR: Supprime un message.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const deleteMessage = CatchAsyncError(async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.auth._id;

    // EN: Find message and verify user is the sender
    // FR: Trouver le message et vérifier que l'utilisateur est l'expéditeur
    const message = await Message.findOne({
      _id: messageId,
      sender: userId
    });

    if (!message) {
      return next(new Errors("Message non trouvé ou vous n'êtes pas autorisé à le supprimer", 404));
    }

    // EN: Delete the message
    // FR: Supprimer le message
    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      success: true,
      message: "Message supprimé avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Likes or unlikes a message.
 * FR: Aime ou n'aime plus un message.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const toggleMessageLike = CatchAsyncError(async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.auth._id;

    // EN: Find the message
    // FR: Trouver le message
    const message = await Message.findById(messageId);

    if (!message) {
      return next(new Errors("Message non trouvé", 404));
    }

    // EN: Check if user already liked the message
    // FR: Vérifier si l'utilisateur a déjà aimé le message
    const userLiked = message.likes.includes(userId);

    if (userLiked) {
      // EN: Remove like
      // FR: Retirer le like
      message.likes = message.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // EN: Add like
      // FR: Ajouter le like
      message.likes.push(userId);
    }

    await message.save();

    // EN: Populate message with updated likes
    // FR: Peupler le message avec les likes mis à jour
    await message.populate('likes', 'firstName lastName');

    res.status(200).json({
      success: true,
      message,
      action: userLiked ? 'unliked' : 'liked',
      message: userLiked ? "Like retiré avec succès" : "Message aimé avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Marks messages as read in a chat.
 * FR: Marque les messages comme lus dans un chat.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const markMessagesAsRead = CatchAsyncError(async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.auth._id;

    // EN: Verify chat exists and user is a participant
    // FR: Vérifier que le chat existe et que l'utilisateur est participant
    const chat = await Chat.findOne({
      _id: chatId,
      users: { $in: [userId] }
    });

    if (!chat) {
      return next(new Errors("Chat non trouvé ou vous n'y avez pas accès", 404));
    }

    // EN: Update last time message read
    // FR: Mettre à jour la dernière fois qu'un message a été lu
    chat.lastTimeMessageRead = new Date();
    await chat.save();

    res.status(200).json({
      success: true,
      message: "Messages marqués comme lus avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Searches messages in a chat.
 * FR: Recherche des messages dans un chat.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const searchMessages = CatchAsyncError(async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { query, page = 1, limit = 20 } = req.query;
    const userId = req.auth._id;

    if (!query) {
      return next(new Errors("Terme de recherche requis", 400));
    }

    // EN: Verify chat exists and user is a participant
    // FR: Vérifier que le chat existe et que l'utilisateur est participant
    const chat = await Chat.findOne({
      _id: chatId,
      users: { $in: [userId] }
    });

    if (!chat) {
      return next(new Errors("Chat non trouvé ou vous n'y avez pas accès", 404));
    }

    // EN: Calculate pagination
    // FR: Calculer la pagination
    const skip = (page - 1) * limit;

    // EN: Search messages with text content matching the query
    // FR: Rechercher des messages avec un contenu texte correspondant à la requête
    const messages = await Message.find({
      chat: chatId,
      content: { $regex: query, $options: 'i' }
    })
      .populate('sender', 'firstName lastName email profilePicture')
      .populate('replyTo.message')
      .populate('replyTo.user', 'firstName lastName')
      .populate('file')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // EN: Get total count for pagination info
    // FR: Récupérer le nombre total pour les informations de pagination
    const totalMessages = await Message.countDocuments({
      chat: chatId,
      content: { $regex: query, $options: 'i' }
    });

    res.status(200).json({
      success: true,
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasNextPage: page < Math.ceil(totalMessages / limit),
        hasPrevPage: page > 1
      },
      query,
      message: "Recherche de messages terminée avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

export default {
  sendMessage,
  getChatMessages,
  updateMessage,
  deleteMessage,
  toggleMessageLike,
  markMessagesAsRead,
  searchMessages
};
