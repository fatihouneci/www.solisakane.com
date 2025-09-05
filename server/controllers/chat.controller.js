/**
 * @file chat.controller.js
 * @description
 * EN: This file contains the controller functions for chat-related operations.
 * FR: Ce fichier contient les fonctions du contrôleur pour les opérations liées au chat.
 */
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Errors from "../helpers/Errors.js";
import CatchAsyncError from "../helpers/CatchAsyncError.js";

/**
 * EN: Creates a new chat (individual or group).
 * FR: Crée un nouveau chat (individuel ou de groupe).
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const createChat = CatchAsyncError(async (req, res, next) => {
  try {
    const { users, chatName, isGroupChat } = req.body;
    const currentUserId = req.auth._id;

    // EN: Add current user to the chat participants
    // FR: Ajouter l'utilisateur actuel aux participants du chat
    const chatUsers = [currentUserId, ...users];

    // EN: For individual chat, check if chat already exists
    // FR: Pour un chat individuel, vérifier si le chat existe déjà
    if (!isGroupChat && chatUsers.length === 2) {
      const existingChat = await Chat.findOne({
        isGroupChat: false,
        users: { $all: chatUsers }
      }).populate('users', 'firstName lastName email profilePicture');

      if (existingChat) {
        return res.status(200).json({
          success: true,
          chat: existingChat,
          message: "Chat existant trouvé"
        });
      }
    }

    // EN: Create new chat
    // FR: Créer un nouveau chat
    const chatData = {
      users: chatUsers,
      isGroupChat: isGroupChat || false,
      owner: currentUserId
    };

    if (isGroupChat && chatName) {
      chatData.chatName = chatName;
    }

    const chat = new Chat(chatData);
    await chat.save();

    // EN: Populate the chat with user details
    // FR: Peupler le chat avec les détails des utilisateurs
    await chat.populate('users', 'firstName lastName email profilePicture online status lastSeen');

    res.status(201).json({
      success: true,
      chat,
      message: "Chat créé avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Gets all chats for the authenticated user.
 * FR: Récupère tous les chats pour l'utilisateur authentifié.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getUserChats = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;

    // EN: Find all chats where the user is a participant
    // FR: Trouver tous les chats où l'utilisateur est participant
    const chats = await Chat.find({
      users: { $in: [userId] }
    })
    .populate('users', 'firstName lastName email profilePicture online status lastSeen')
    .populate('lastMessage')
    .populate('owner', 'firstName lastName')
    .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      chats,
      message: "Chats récupérés avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Gets a specific chat by ID.
 * FR: Récupère un chat spécifique par ID.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getChat = CatchAsyncError(async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.auth._id;

    // EN: Find chat and verify user is a participant
    // FR: Trouver le chat et vérifier que l'utilisateur est participant
    const chat = await Chat.findOne({
      _id: chatId,
      users: { $in: [userId] }
    })
    .populate('users', 'firstName lastName email profilePicture online status lastSeen')
    .populate('lastMessage')
    .populate('owner', 'firstName lastName');

    if (!chat) {
      return next(new Errors("Chat non trouvé", 404));
    }

    res.status(200).json({
      success: true,
      chat,
      message: "Chat récupéré avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Updates a chat (e.g., group name, participants).
 * FR: Met à jour un chat (ex: nom du groupe, participants).
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const updateChat = CatchAsyncError(async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.auth._id;
    const { chatName, users } = req.body;

    // EN: Find chat and verify user is owner or participant
    // FR: Trouver le chat et vérifier que l'utilisateur est propriétaire ou participant
    const chat = await Chat.findOne({
      _id: chatId,
      users: { $in: [userId] }
    });

    if (!chat) {
      return next(new Errors("Chat non trouvé", 404));
    }

    // EN: Only owner can update group chat
    // FR: Seul le propriétaire peut mettre à jour le chat de groupe
    if (chat.isGroupChat && chat.owner.toString() !== userId.toString()) {
      return next(new Errors("Seul le propriétaire peut modifier ce chat", 403));
    }

    // EN: Update chat fields
    // FR: Mettre à jour les champs du chat
    if (chatName) chat.chatName = chatName;
    if (users) chat.users = users;

    await chat.save();

    // EN: Populate the updated chat
    // FR: Peupler le chat mis à jour
    await chat.populate('users', 'firstName lastName email profilePicture online status lastSeen');
    await chat.populate('owner', 'firstName lastName');

    res.status(200).json({
      success: true,
      chat,
      message: "Chat mis à jour avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Deletes a chat.
 * FR: Supprime un chat.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const deleteChat = CatchAsyncError(async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.auth._id;

    // EN: Find chat and verify user is owner
    // FR: Trouver le chat et vérifier que l'utilisateur est propriétaire
    const chat = await Chat.findOne({
      _id: chatId,
      owner: userId
    });

    if (!chat) {
      return next(new Errors("Chat non trouvé ou vous n'êtes pas autorisé à le supprimer", 404));
    }

    // EN: Delete all messages in this chat
    // FR: Supprimer tous les messages de ce chat
    await Message.deleteMany({ chat: chatId });

    // EN: Delete the chat
    // FR: Supprimer le chat
    await Chat.findByIdAndDelete(chatId);

    res.status(200).json({
      success: true,
      message: "Chat supprimé avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Adds a user to a group chat.
 * FR: Ajoute un utilisateur à un chat de groupe.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const addUserToChat = CatchAsyncError(async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;
    const currentUserId = req.auth._id;

    // EN: Find chat and verify user is owner
    // FR: Trouver le chat et vérifier que l'utilisateur est propriétaire
    const chat = await Chat.findOne({
      _id: chatId,
      owner: currentUserId,
      isGroupChat: true
    });

    if (!chat) {
      return next(new Errors("Chat de groupe non trouvé ou vous n'êtes pas autorisé", 404));
    }

    // EN: Check if user is already in the chat
    // FR: Vérifier si l'utilisateur est déjà dans le chat
    if (chat.users.includes(userId)) {
      return next(new Errors("L'utilisateur est déjà dans ce chat", 400));
    }

    // EN: Add user to chat
    // FR: Ajouter l'utilisateur au chat
    chat.users.push(userId);
    await chat.save();

    // EN: Populate the updated chat
    // FR: Peupler le chat mis à jour
    await chat.populate('users', 'firstName lastName email profilePicture online status lastSeen');

    res.status(200).json({
      success: true,
      chat,
      message: "Utilisateur ajouté au chat avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Removes a user from a group chat.
 * FR: Retire un utilisateur d'un chat de groupe.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const removeUserFromChat = CatchAsyncError(async (req, res, next) => {
  try {
    const { chatId, userId } = req.params;
    const currentUserId = req.auth._id;

    // EN: Find chat and verify user is owner or the user being removed
    // FR: Trouver le chat et vérifier que l'utilisateur est propriétaire ou l'utilisateur à retirer
    const chat = await Chat.findOne({
      _id: chatId,
      isGroupChat: true
    });

    if (!chat) {
      return next(new Errors("Chat de groupe non trouvé", 404));
    }

    // EN: Check authorization
    // FR: Vérifier l'autorisation
    if (chat.owner.toString() !== currentUserId.toString() && currentUserId.toString() !== userId) {
      return next(new Errors("Vous n'êtes pas autorisé à effectuer cette action", 403));
    }

    // EN: Remove user from chat
    // FR: Retirer l'utilisateur du chat
    chat.users = chat.users.filter(id => id.toString() !== userId);
    await chat.save();

    // EN: Populate the updated chat
    // FR: Peupler le chat mis à jour
    await chat.populate('users', 'firstName lastName email profilePicture online status lastSeen');

    res.status(200).json({
      success: true,
      chat,
      message: "Utilisateur retiré du chat avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

export default {
  createChat,
  getUserChats,
  getChat,
  updateChat,
  deleteChat,
  addUserToChat,
  removeUserFromChat
};
