import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import Errors from "../helpers/Errors.js";
import CatchAsyncError from "../helpers/CatchAsyncError.js";

const sendMessage = CatchAsyncError(async (req, res, next) => {
  try {
    const { chat, content, type = 'text', file, replyTo } = req.body;
    const senderId = req.auth._id;

    // Validate required fields
    if (!chat) {
      return next(new Errors("Chat ID is required", 400));
    }

    if (type === 'text' && (!content || content.trim().length === 0)) {
      return next(new Errors("Message content is required", 400));
    }

    if (type === 'file' && !file) {
      return next(new Errors("File is required for file messages", 400));
    }

    // Check if chat exists and user is a participant
    const chatExists = await Chat.findOne({ 
      _id: chat, 
      users: senderId 
    });

    if (!chatExists) {
      return next(new Errors("Chat not found or access denied", 404));
    }

    // Validate replyTo message if provided
    if (replyTo) {
      const replyMessage = await Message.findOne({ 
        _id: replyTo, 
        chat: chat 
      });
      if (!replyMessage) {
        return next(new Errors("Reply message not found", 404));
      }
    }

    const messageData = {
      chat,
      content: content || '',
      type,
      sender: senderId
    };

    if (file) {
      messageData.file = file;
    }

    if (replyTo) {
      messageData.replyTo = {
        message: replyTo,
        user: senderId
      };
    }

    const message = new Message(messageData);
    await message.save();

    // Update chat's last message
    await Chat.findByIdAndUpdate(chat, {
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

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      message
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const getMessages = CatchAsyncError(async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.auth._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    // Check if user is a participant in the chat
    const chat = await Chat.findOne({ 
      _id: chatId, 
      users: userId 
    });

    if (!chat) {
      return next(new Errors("Chat not found or access denied", 404));
    }

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'fullName profilePicture email')
      .populate('file', 'name type data')
      .populate('replyTo.message', 'content type sender')
      .populate('replyTo.user', 'fullName')
      .populate('likes', 'fullName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments({ chat: chatId });

    res.status(200).json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const getMessageById = CatchAsyncError(async (req, res, next) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.auth._id;

    const message = await Message.findById(messageId)
      .populate('sender', 'fullName profilePicture email')
      .populate('file', 'name type data')
      .populate('replyTo.message', 'content type sender')
      .populate('replyTo.user', 'fullName')
      .populate('likes', 'fullName');

    if (!message) {
      return next(new Errors("Message not found", 404));
    }

    // Check if user is a participant in the chat
    const chat = await Chat.findOne({ 
      _id: message.chat, 
      users: userId 
    });

    if (!chat) {
      return next(new Errors("Access denied", 403));
    }

    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const updateMessage = CatchAsyncError(async (req, res, next) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.auth._id;
    const { content } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
      return next(new Errors("Message not found", 404));
    }

    // Only sender can update their message
    if (message.sender.toString() !== userId.toString()) {
      return next(new Errors("You can only update your own messages", 403));
    }

    // Only text messages can be updated
    if (message.type !== 'text') {
      return next(new Errors("Only text messages can be updated", 400));
    }

    // Check if message is not too old (e.g., within 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (message.createdAt < fifteenMinutesAgo) {
      return next(new Errors("Message is too old to be updated", 400));
    }

    message.content = content;
    message.updatedAt = new Date();
    await message.save();

    await message.populate([
      { path: 'sender', select: 'fullName profilePicture email' },
      { path: 'file', select: 'name type data' },
      { path: 'replyTo.message', select: 'content type sender' },
      { path: 'replyTo.user', select: 'fullName' },
      { path: 'likes', select: 'fullName' }
    ]);

    res.status(200).json({
      success: true,
      message: "Message updated successfully",
      message
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const deleteMessage = CatchAsyncError(async (req, res, next) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.auth._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return next(new Errors("Message not found", 404));
    }

    // Check if user is a participant in the chat
    const chat = await Chat.findOne({ 
      _id: message.chat, 
      users: userId 
    });

    if (!chat) {
      return next(new Errors("Access denied", 403));
    }

    // Only sender can delete their message
    if (message.sender.toString() !== userId.toString()) {
      return next(new Errors("You can only delete your own messages", 403));
    }

    // Check if message is not too old (e.g., within 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (message.createdAt < oneHourAgo) {
      return next(new Errors("Message is too old to be deleted", 400));
    }

    await Message.findByIdAndDelete(messageId);

    // Update chat's last message if this was the last message
    const lastMessage = await Message.findOne({ chat: message.chat })
      .sort({ createdAt: -1 });

    await Chat.findByIdAndUpdate(message.chat, {
      lastMessage: lastMessage ? lastMessage._id : null
    });

    res.status(200).json({
      success: true,
      message: "Message deleted successfully"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const addReaction = CatchAsyncError(async (req, res, next) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.auth._id;
    const { reaction } = req.body;

    if (!reaction) {
      return next(new Errors("Reaction is required", 400));
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return next(new Errors("Message not found", 404));
    }

    // Check if user is a participant in the chat
    const chat = await Chat.findOne({ 
      _id: message.chat, 
      users: userId 
    });

    if (!chat) {
      return next(new Errors("Access denied", 403));
    }

    // Check if user already reacted
    const existingReaction = message.likes.find(like => 
      like.toString() === userId.toString()
    );

    if (existingReaction) {
      return next(new Errors("You have already reacted to this message", 400));
    }

    message.likes.push(userId);
    await message.save();

    await message.populate([
      { path: 'sender', select: 'fullName profilePicture email' },
      { path: 'file', select: 'name type data' },
      { path: 'replyTo.message', select: 'content type sender' },
      { path: 'replyTo.user', select: 'fullName' },
      { path: 'likes', select: 'fullName' }
    ]);

    res.status(200).json({
      success: true,
      message: "Reaction added successfully",
      message
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const removeReaction = CatchAsyncError(async (req, res, next) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.auth._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return next(new Errors("Message not found", 404));
    }

    // Check if user is a participant in the chat
    const chat = await Chat.findOne({ 
      _id: message.chat, 
      users: userId 
    });

    if (!chat) {
      return next(new Errors("Access denied", 403));
    }

    // Check if user has reacted
    const existingReactionIndex = message.likes.findIndex(like => 
      like.toString() === userId.toString()
    );

    if (existingReactionIndex === -1) {
      return next(new Errors("You have not reacted to this message", 400));
    }

    message.likes.splice(existingReactionIndex, 1);
    await message.save();

    await message.populate([
      { path: 'sender', select: 'fullName profilePicture email' },
      { path: 'file', select: 'name type data' },
      { path: 'replyTo.message', select: 'content type sender' },
      { path: 'replyTo.user', select: 'fullName' },
      { path: 'likes', select: 'fullName' }
    ]);

    res.status(200).json({
      success: true,
      message: "Reaction removed successfully",
      message
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const markAsRead = CatchAsyncError(async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.auth._id;

    // Check if user is a participant in the chat
    const chat = await Chat.findOne({ 
      _id: chatId, 
      users: userId 
    });

    if (!chat) {
      return next(new Errors("Chat not found or access denied", 404));
    }

    // Update last read time
    await Chat.findByIdAndUpdate(chatId, {
      lastTimeMessageRead: new Date()
    });

    res.status(200).json({
      success: true,
      message: "Messages marked as read"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

export default {
  sendMessage,
  getMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  markAsRead
};
