/**
 * @file socket.service.js
 * @description
 * EN: This file contains the Socket.IO service for real-time communication.
 * FR: Ce fichier contient le service Socket.IO pour la communication en temps réel.
 */
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import User from '../models/user.model.js';
import Chat from '../models/chat.model.js';
import Message from '../models/message.model.js';
import Call from '../models/call.model.js';

/**
 * EN: Socket.IO service class for handling real-time communication
 * FR: Classe de service Socket.IO pour gérer la communication en temps réel
 */
class SocketService {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // EN: Map to store connected users / FR: Map pour stocker les utilisateurs connectés
    this.setupSocketHandlers();
  }

  /**
   * EN: Setup Socket.IO event handlers
   * FR: Configurer les gestionnaires d'événements Socket.IO
   */
  setupSocketHandlers() {
    this.io.on('connection', async (socket) => {
      console.log('EN: New socket connection / FR: Nouvelle connexion socket:', socket.id);

      // EN: Handle user authentication
      // FR: Gérer l'authentification de l'utilisateur
      socket.on('authenticate', async (data) => {
        try {
          const { token } = data;
          const decoded = jwt.verify(token, config.jwtSecret);
          const user = await User.findById(decoded._id);

          if (!user) {
            socket.emit('auth_error', { message: 'User not found' });
            return;
          }

          // EN: Store user connection info
          // FR: Stocker les informations de connexion de l'utilisateur
          this.connectedUsers.set(socket.id, {
            userId: user._id.toString(),
            user: user,
            socket: socket
          });

          // EN: Update user's socket ID and online status
          // FR: Mettre à jour l'ID de socket et le statut en ligne de l'utilisateur
          user.socketId = socket.id;
          user.online = true;
          user.status = 'online';
          user.lastSeen = new Date();
          await user.save();

          // EN: Join user to their personal room
          // FR: Faire rejoindre l'utilisateur à sa salle personnelle
          socket.join(`user_${user._id}`);

          // EN: Join user to all their chat rooms
          // FR: Faire rejoindre l'utilisateur à toutes ses salles de chat
          const userChats = await Chat.find({ users: { $in: [user._id] } });
          userChats.forEach(chat => {
            socket.join(`chat_${chat._id}`);
          });

          // EN: Notify other users that this user is online
          // FR: Notifier les autres utilisateurs que cet utilisateur est en ligne
          socket.broadcast.emit('user_online', {
            userId: user._id,
            user: {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              profilePicture: user.profilePicture,
              online: true,
              status: 'online'
            }
          });

          socket.emit('authenticated', {
            success: true,
            user: {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              profilePicture: user.profilePicture,
              online: true,
              status: 'online'
            }
          });

          console.log(`EN: User ${user.firstName} ${user.lastName} authenticated / FR: Utilisateur ${user.firstName} ${user.lastName} authentifié`);
        } catch (error) {
          console.error('EN: Authentication error / FR: Erreur d\'authentification:', error);
          socket.emit('auth_error', { message: 'Invalid token' });
        }
      });

      // EN: Handle joining a chat room
      // FR: Gérer la jonction à une salle de chat
      socket.on('join_chat', async (data) => {
        try {
          const { chatId } = data;
          const userConnection = this.connectedUsers.get(socket.id);

          if (!userConnection) {
            socket.emit('error', { message: 'User not authenticated' });
            return;
          }

          // EN: Verify user is a participant in the chat
          // FR: Vérifier que l'utilisateur est participant dans le chat
          const chat = await Chat.findOne({
            _id: chatId,
            users: { $in: [userConnection.userId] }
          });

          if (!chat) {
            socket.emit('error', { message: 'Chat not found or access denied' });
            return;
          }

          socket.join(`chat_${chatId}`);
          socket.emit('joined_chat', { chatId, success: true });

          // EN: Notify other users in the chat
          // FR: Notifier les autres utilisateurs dans le chat
          socket.to(`chat_${chatId}`).emit('user_joined_chat', {
            chatId,
            user: {
              _id: userConnection.userId,
              firstName: userConnection.user.firstName,
              lastName: userConnection.user.lastName,
              profilePicture: userConnection.user.profilePicture
            }
          });
        } catch (error) {
          console.error('EN: Join chat error / FR: Erreur de jonction au chat:', error);
          socket.emit('error', { message: 'Failed to join chat' });
        }
      });

      // EN: Handle leaving a chat room
      // FR: Gérer la sortie d'une salle de chat
      socket.on('leave_chat', (data) => {
        const { chatId } = data;
        socket.leave(`chat_${chatId}`);
        socket.emit('left_chat', { chatId, success: true });
      });

      // EN: Handle sending a message
      // FR: Gérer l'envoi d'un message
      socket.on('send_message', async (data) => {
        try {
          const { chatId, content, type = 'text', replyTo, file } = data;
          const userConnection = this.connectedUsers.get(socket.id);

          if (!userConnection) {
            socket.emit('error', { message: 'User not authenticated' });
            return;
          }

          // EN: Verify chat exists and user is a participant
          // FR: Vérifier que le chat existe et que l'utilisateur est participant
          const chat = await Chat.findOne({
            _id: chatId,
            users: { $in: [userConnection.userId] }
          }).populate('users', 'firstName lastName email profilePicture online status');

          if (!chat) {
            socket.emit('error', { message: 'Chat not found or access denied' });
            return;
          }

          // EN: Create new message
          // FR: Créer un nouveau message
          const messageData = {
            chat: chatId,
            content,
            type,
            sender: userConnection.userId
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

          // EN: Emit message to all users in the chat
          // FR: Émettre le message à tous les utilisateurs dans le chat
          this.io.to(`chat_${chatId}`).emit('new_message', {
            message,
            chatId
          });

          // EN: Emit message to users not in the chat room (for notifications)
          // FR: Émettre le message aux utilisateurs pas dans la salle de chat (pour les notifications)
          chat.users.forEach(user => {
            if (user._id.toString() !== userConnection.userId) {
              this.io.to(`user_${user._id}`).emit('message_notification', {
                message,
                chatId,
                chatName: chat.chatName || `${userConnection.user.firstName} ${userConnection.user.lastName}`
              });
            }
          });

        } catch (error) {
          console.error('EN: Send message error / FR: Erreur d\'envoi de message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // EN: Handle typing indicator
      // FR: Gérer l'indicateur de frappe
      socket.on('typing', (data) => {
        const { chatId, isTyping } = data;
        const userConnection = this.connectedUsers.get(socket.id);

        if (userConnection) {
          socket.to(`chat_${chatId}`).emit('user_typing', {
            chatId,
            userId: userConnection.userId,
            user: {
              _id: userConnection.userId,
              firstName: userConnection.user.firstName,
              lastName: userConnection.user.lastName
            },
            isTyping
          });
        }
      });

      // EN: Handle call initiation
      // FR: Gérer l'initiation d'appel
      socket.on('initiate_call', async (data) => {
        try {
          const { chatId, callType, recipientId } = data;
          const userConnection = this.connectedUsers.get(socket.id);

          if (!userConnection) {
            socket.emit('error', { message: 'User not authenticated' });
            return;
          }

          // EN: Emit call to recipient
          // FR: Émettre l'appel au destinataire
          this.io.to(`user_${recipientId}`).emit('incoming_call', {
            chatId,
            callType,
            caller: {
              _id: userConnection.userId,
              firstName: userConnection.user.firstName,
              lastName: userConnection.user.lastName,
              profilePicture: userConnection.user.profilePicture
            }
          });

          // EN: Emit call initiated confirmation to caller
          // FR: Émettre la confirmation d'appel initié à l'appelant
          socket.emit('call_initiated', {
            chatId,
            callType,
            success: true
          });

        } catch (error) {
          console.error('EN: Initiate call error / FR: Erreur d\'initiation d\'appel:', error);
          socket.emit('error', { message: 'Failed to initiate call' });
        }
      });

      // EN: Handle call answer
      // FR: Gérer la réponse à l'appel
      socket.on('answer_call', (data) => {
        const { chatId, callId, accepted } = data;
        const userConnection = this.connectedUsers.get(socket.id);

        if (userConnection) {
          // EN: Emit call answer to all users in the chat
          // FR: Émettre la réponse d'appel à tous les utilisateurs dans le chat
          this.io.to(`chat_${chatId}`).emit('call_answered', {
            chatId,
            callId,
            accepted,
            user: {
              _id: userConnection.userId,
              firstName: userConnection.user.firstName,
              lastName: userConnection.user.lastName
            }
          });
        }
      });

      // EN: Handle call end
      // FR: Gérer la fin d'appel
      socket.on('end_call', (data) => {
        const { chatId, callId } = data;
        const userConnection = this.connectedUsers.get(socket.id);

        if (userConnection) {
          // EN: Emit call end to all users in the chat
          // FR: Émettre la fin d'appel à tous les utilisateurs dans le chat
          this.io.to(`chat_${chatId}`).emit('call_ended', {
            chatId,
            callId,
            user: {
              _id: userConnection.userId,
              firstName: userConnection.user.firstName,
              lastName: userConnection.user.lastName
            }
          });
        }
      });

      // EN: Handle user status change
      // FR: Gérer le changement de statut utilisateur
      socket.on('status_change', async (data) => {
        try {
          const { status } = data;
          const userConnection = this.connectedUsers.get(socket.id);

          if (!userConnection) {
            return;
          }

          // EN: Update user status in database
          // FR: Mettre à jour le statut utilisateur dans la base de données
          const user = await User.findById(userConnection.userId);
          if (user) {
            user.status = status;
            user.lastSeen = new Date();
            await user.save();

            // EN: Notify all connected users about status change
            // FR: Notifier tous les utilisateurs connectés du changement de statut
            this.io.emit('user_status_changed', {
              userId: user._id,
              status,
              lastSeen: user.lastSeen
            });
          }
        } catch (error) {
          console.error('EN: Status change error / FR: Erreur de changement de statut:', error);
        }
      });

      // EN: Handle disconnection
      // FR: Gérer la déconnexion
      socket.on('disconnect', async () => {
        try {
          const userConnection = this.connectedUsers.get(socket.id);

          if (userConnection) {
            // EN: Update user's online status
            // FR: Mettre à jour le statut en ligne de l'utilisateur
            const user = await User.findById(userConnection.userId);
            if (user) {
              user.online = false;
              user.status = 'offline';
              user.socketId = null;
              user.lastSeen = new Date();
              await user.save();

              // EN: Notify other users that this user is offline
              // FR: Notifier les autres utilisateurs que cet utilisateur est hors ligne
              socket.broadcast.emit('user_offline', {
                userId: user._id,
                user: {
                  _id: user._id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  profilePicture: user.profilePicture,
                  online: false,
                  status: 'offline',
                  lastSeen: user.lastSeen
                }
              });
            }

            // EN: Remove user from connected users map
            // FR: Retirer l'utilisateur de la map des utilisateurs connectés
            this.connectedUsers.delete(socket.id);
          }

          console.log('EN: User disconnected / FR: Utilisateur déconnecté:', socket.id);
        } catch (error) {
          console.error('EN: Disconnect error / FR: Erreur de déconnexion:', error);
        }
      });
    });
  }

  /**
   * EN: Get connected users count
   * FR: Obtenir le nombre d'utilisateurs connectés
   * @returns {number} Number of connected users / Nombre d'utilisateurs connectés
   */
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  /**
   * EN: Get connected users list
   * FR: Obtenir la liste des utilisateurs connectés
   * @returns {Array} Array of connected users / Tableau des utilisateurs connectés
   */
  getConnectedUsers() {
    return Array.from(this.connectedUsers.values()).map(connection => ({
      userId: connection.userId,
      user: connection.user,
      socketId: connection.socket.id
    }));
  }

  /**
   * EN: Send message to specific user
   * FR: Envoyer un message à un utilisateur spécifique
   * @param {string} userId - User ID / ID utilisateur
   * @param {string} event - Event name / Nom de l'événement
   * @param {object} data - Data to send / Données à envoyer
   */
  sendToUser(userId, event, data) {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  /**
   * EN: Send message to specific chat
   * FR: Envoyer un message à un chat spécifique
   * @param {string} chatId - Chat ID / ID du chat
   * @param {string} event - Event name / Nom de l'événement
   * @param {object} data - Data to send / Données à envoyer
   */
  sendToChat(chatId, event, data) {
    this.io.to(`chat_${chatId}`).emit(event, data);
  }
}

export default SocketService;
