import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import User from '../models/user.model.js';
import Chat from '../models/chat.model.js';
import Message from '../models/message.model.js';
import Call from '../models/call.model.js';
import logger from '../helpers/logger.js';
import notificationService from '../helpers/NotificationService.js';

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // Map of userId -> socketId
    this.userSockets = new Map(); // Map of socketId -> userId
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, config.jwtSecret);
        const user = await User.findById(decoded._id);
        
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`User connected: ${socket.userId} (${socket.id})`);
      
      this.handleConnection(socket);
      this.setupUserEvents(socket);
      this.setupChatEvents(socket);
      this.setupCallEvents(socket);
      this.setupDisconnection(socket);
    });
  }

  handleConnection(socket) {
    const userId = socket.userId;
    
    // Store user connection
    this.connectedUsers.set(userId, socket.id);
    this.userSockets.set(socket.id, userId);

    // Update user online status
    this.updateUserStatus(userId, 'online');

    // Join user to their personal room
    socket.join(`user_${userId}`);

    // Notify contacts about online status
    this.notifyContactsStatusChange(userId, 'online');
  }

  setupUserEvents(socket) {
    // Handle typing indicators
    socket.on('typing_start', async (data) => {
      const { chatId } = data;
      const userId = socket.userId;

      // Verify user is in the chat
      const chat = await Chat.findOne({ _id: chatId, users: userId });
      if (!chat) return;

      // Notify other users in the chat
      socket.to(`chat_${chatId}`).emit('user_typing', {
        userId,
        chatId,
        isTyping: true
      });
    });

    socket.on('typing_stop', async (data) => {
      const { chatId } = data;
      const userId = socket.userId;

      // Verify user is in the chat
      const chat = await Chat.findOne({ _id: chatId, users: userId });
      if (!chat) return;

      // Notify other users in the chat
      socket.to(`chat_${chatId}`).emit('user_typing', {
        userId,
        chatId,
        isTyping: false
      });
    });

    // Handle presence updates
    socket.on('update_presence', async (data) => {
      const { status } = data;
      const userId = socket.userId;

      if (['online', 'away', 'offline'].includes(status)) {
        await this.updateUserStatus(userId, status);
        this.notifyContactsStatusChange(userId, status);
      }
    });
  }

  setupChatEvents(socket) {
    // Handle joining chat rooms
    socket.on('join_chat', async (data) => {
      const { chatId } = data;
      const userId = socket.userId;

      try {
        // Verify user is in the chat
        const chat = await Chat.findOne({ _id: chatId, users: userId });
        if (!chat) {
          socket.emit('error', { message: 'Access denied to chat' });
          return;
        }

        // Join the chat room
        socket.join(`chat_${chatId}`);
        
        // Mark messages as read
        await Chat.findByIdAndUpdate(chatId, {
          lastTimeMessageRead: new Date()
        });

        logger.info(`User ${userId} joined chat ${chatId}`);
      } catch (error) {
        logger.error('Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle leaving chat rooms
    socket.on('leave_chat', (data) => {
      const { chatId } = data;
      socket.leave(`chat_${chatId}`);
      logger.info(`User ${socket.userId} left chat ${chatId}`);
    });

    // Handle new messages
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, type = 'text', file, replyTo } = data;
        const senderId = socket.userId;

        // Verify user is in the chat
        const chat = await Chat.findOne({ _id: chatId, users: senderId });
        if (!chat) {
          socket.emit('error', { message: 'Access denied to chat' });
          return;
        }

        // Create message
        const messageData = {
          chat: chatId,
          content: content || '',
          type,
          sender: senderId
        };

        if (file) messageData.file = file;
        if (replyTo) messageData.replyTo = { message: replyTo, user: senderId };

        const message = new Message(messageData);
        await message.save();

        // Update chat's last message
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: message._id,
          lastTimeMessageRead: new Date()
        });

        // Populate message data
        await message.populate([
          { path: 'sender', select: 'fullName profilePicture email' },
          { path: 'file', select: 'name type data' },
          { path: 'replyTo.message', select: 'content type sender' },
          { path: 'replyTo.user', select: 'fullName' }
        ]);

        // Broadcast message to all users in the chat
        this.io.to(`chat_${chatId}`).emit('new_message', {
          message,
          chatId
        });

        // Send push notifications to offline users
        const offlineUsers = chat.users.filter(userId => 
          userId.toString() !== senderId && !this.connectedUsers.has(userId.toString())
        );

        for (const userId of offlineUsers) {
          try {
            await notificationService.sendChatMessageNotification(
              senderId,
              userId.toString(),
              message
            );
          } catch (error) {
            logger.error('Failed to send push notification:', error);
          }
        }

        logger.info(`Message sent in chat ${chatId} by user ${senderId}`);
      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message reactions
    socket.on('react_to_message', async (data) => {
      try {
        const { messageId, reaction } = data;
        const userId = socket.userId;

        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Verify user is in the chat
        const chat = await Chat.findOne({ _id: message.chat, users: userId });
        if (!chat) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Check if user already reacted
        const existingReaction = message.likes.find(like => 
          like.toString() === userId
        );

        if (existingReaction) {
          // Remove reaction
          message.likes = message.likes.filter(like => 
            like.toString() !== userId
          );
        } else {
          // Add reaction
          message.likes.push(userId);
        }

        await message.save();

        // Broadcast reaction update
        this.io.to(`chat_${message.chat}`).emit('message_reaction_updated', {
          messageId,
          message
        });

        logger.info(`Reaction updated for message ${messageId} by user ${userId}`);
      } catch (error) {
        logger.error('Error updating message reaction:', error);
        socket.emit('error', { message: 'Failed to update reaction' });
      }
    });
  }

  setupCallEvents(socket) {
    // Handle call initiation
    socket.on('initiate_call', async (data) => {
      try {
        const { chatId, callType, recipientId } = data;
        const callerId = socket.userId;

        // Verify chat and participants
        const chat = await Chat.findOne({ 
          _id: chatId, 
          users: { $all: [callerId, recipientId] } 
        });

        if (!chat) {
          socket.emit('error', { message: 'Invalid chat or participants' });
          return;
        }

        // Check for existing active calls
        const existingCall = await Call.findOne({
          chatId,
          status: { $in: ['initiated', 'ringing', 'accepted'] }
        });

        if (existingCall) {
          socket.emit('error', { message: 'Call already in progress' });
          return;
        }

        // Create call record
        const call = new Call({
          chatId,
          callId: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          callerId,
          callType,
          status: 'initiated'
        });

        await call.save();

        // Update chat with ongoing call
        await Chat.findByIdAndUpdate(chatId, {
          'ongoingCall.callId': call._id,
          'ongoingCall.chatId': chatId,
          'ongoingCall.callerId': callerId,
          'ongoingCall.cameraStatus': callType === 'video',
          'ongoingCall.microphoneStatus': true,
          'ongoingCall.startedAt': new Date()
        });

        // Notify recipient
        const recipientSocketId = this.connectedUsers.get(recipientId);
        if (recipientSocketId) {
          this.io.to(recipientSocketId).emit('incoming_call', {
            call,
            caller: socket.user
          });
        } else {
          // Send push notification
          try {
            await notificationService.sendCallNotification({
              callerId,
              recipientId,
              chatId,
              callId: call.callId,
              callType
            });
          } catch (error) {
            logger.error('Failed to send call notification:', error);
          }
        }

        // Notify caller
        socket.emit('call_initiated', { call });

        logger.info(`Call initiated by ${callerId} to ${recipientId}`);
      } catch (error) {
        logger.error('Error initiating call:', error);
        socket.emit('error', { message: 'Failed to initiate call' });
      }
    });

    // Handle call answer
    socket.on('answer_call', async (data) => {
      try {
        const { callId } = data;
        const userId = socket.userId;

        const call = await Call.findOne({ callId });
        if (!call) {
          socket.emit('error', { message: 'Call not found' });
          return;
        }

        // Update call status
        await call.updateStatus('accepted');

        // Notify caller
        const callerSocketId = this.connectedUsers.get(call.callerId.toString());
        if (callerSocketId) {
          this.io.to(callerSocketId).emit('call_answered', { call });
        }

        // Notify all participants
        this.io.to(`chat_${call.chatId}`).emit('call_status_changed', {
          callId: call.callId,
          status: 'accepted'
        });

        logger.info(`Call ${callId} answered by ${userId}`);
      } catch (error) {
        logger.error('Error answering call:', error);
        socket.emit('error', { message: 'Failed to answer call' });
      }
    });

    // Handle call decline
    socket.on('decline_call', async (data) => {
      try {
        const { callId } = data;
        const userId = socket.userId;

        const call = await Call.findOne({ callId });
        if (!call) {
          socket.emit('error', { message: 'Call not found' });
          return;
        }

        // Update call status
        await call.updateStatus('declined');

        // Clear ongoing call from chat
        await Chat.findByIdAndUpdate(call.chatId, {
          $unset: { ongoingCall: 1 }
        });

        // Notify caller
        const callerSocketId = this.connectedUsers.get(call.callerId.toString());
        if (callerSocketId) {
          this.io.to(callerSocketId).emit('call_declined', { call });
        }

        logger.info(`Call ${callId} declined by ${userId}`);
      } catch (error) {
        logger.error('Error declining call:', error);
        socket.emit('error', { message: 'Failed to decline call' });
      }
    });

    // Handle call end
    socket.on('end_call', async (data) => {
      try {
        const { callId } = data;
        const userId = socket.userId;

        const call = await Call.findOne({ callId });
        if (!call) {
          socket.emit('error', { message: 'Call not found' });
          return;
        }

        // Update call status
        await call.updateStatus('ended');

        // Clear ongoing call from chat
        await Chat.findByIdAndUpdate(call.chatId, {
          $unset: { ongoingCall: 1 }
        });

        // Notify all participants
        this.io.to(`chat_${call.chatId}`).emit('call_ended', { call });

        logger.info(`Call ${callId} ended by ${userId}`);
      } catch (error) {
        logger.error('Error ending call:', error);
        socket.emit('error', { message: 'Failed to end call' });
      }
    });

    // Handle WebRTC signaling
    socket.on('webrtc_signal', (data) => {
      const { callId, signal, type } = data;
      const userId = socket.userId;

      // Broadcast signal to other participants
      socket.to(`call_${callId}`).emit('webrtc_signal', {
        signal,
        type,
        from: userId
      });
    });
  }

  setupDisconnection(socket) {
    socket.on('disconnect', async (reason) => {
      const userId = socket.userId;
      logger.info(`User disconnected: ${userId} (${socket.id}) - ${reason}`);

      // Remove from connected users
      this.connectedUsers.delete(userId);
      this.userSockets.delete(socket.id);

      // Update user status to offline
      await this.updateUserStatus(userId, 'offline');

      // Notify contacts about offline status
      this.notifyContactsStatusChange(userId, 'offline');

      // Handle ongoing calls
      await this.handleCallDisconnection(userId);
    });
  }

  async updateUserStatus(userId, status) {
    try {
      await User.findByIdAndUpdate(userId, {
        status,
        lastSeen: new Date(),
        online: status === 'online'
      });
    } catch (error) {
      logger.error('Error updating user status:', error);
    }
  }

  async notifyContactsStatusChange(userId, status) {
    try {
      const user = await User.findById(userId).populate('contacts');
      if (!user || !user.contacts) return;

      const userData = {
        _id: user._id,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        status,
        lastSeen: user.lastSeen
      };

      // Notify all contacts who are online
      user.contacts.forEach(contact => {
        const contactSocketId = this.connectedUsers.get(contact._id.toString());
        if (contactSocketId) {
          this.io.to(contactSocketId).emit('contact_status_changed', userData);
        }
      });
    } catch (error) {
      logger.error('Error notifying contacts status change:', error);
    }
  }

  async handleCallDisconnection(userId) {
    try {
      // Find active calls for this user
      const activeCalls = await Call.find({
        $or: [
          { callerId: userId },
          { recipientId: userId }
        ],
        status: { $in: ['initiated', 'ringing', 'accepted'] }
      });

      for (const call of activeCalls) {
        // End the call
        await call.updateStatus('ended');

        // Clear ongoing call from chat
        await Chat.findByIdAndUpdate(call.chatId, {
          $unset: { ongoingCall: 1 }
        });

        // Notify other participants
        this.io.to(`chat_${call.chatId}`).emit('call_ended', { 
          call,
          reason: 'user_disconnected' 
        });
      }
    } catch (error) {
      logger.error('Error handling call disconnection:', error);
    }
  }

  // Utility methods
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  getUserSocket(userId) {
    const socketId = this.connectedUsers.get(userId);
    return socketId ? this.io.sockets.sockets.get(socketId) : null;
  }

  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  sendToChat(chatId, event, data) {
    this.io.to(`chat_${chatId}`).emit(event, data);
  }
}

export default SocketHandler;
