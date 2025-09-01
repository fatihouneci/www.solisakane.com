import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Errors from "../helpers/Errors.js";
import CatchAsyncError from "../helpers/CatchAsyncError.js";

const createChat = CatchAsyncError(async (req, res, next) => {
  try {
    const { users, isGroupChat, chatName } = req.body;
    const currentUserId = req.auth._id;

    // Validate users array
    if (!users || !Array.isArray(users) || users.length < 2) {
      return next(new Errors("At least 2 users are required for a chat", 400));
    }

    // Add current user to users array if not already present
    if (!users.includes(currentUserId)) {
      users.push(currentUserId);
    }

    // For group chats, validate chat name
    if (isGroupChat && (!chatName || chatName.trim().length === 0)) {
      return next(new Errors("Chat name is required for group chats", 400));
    }

    // Check if users exist
    const existingUsers = await User.find({ _id: { $in: users } });
    if (existingUsers.length !== users.length) {
      return next(new Errors("One or more users do not exist", 400));
    }

    // For direct chats, check if chat already exists
    if (!isGroupChat && users.length === 2) {
      const existingChat = await Chat.findOne({
        isGroupChat: false,
        users: { $all: users, $size: 2 }
      });

      if (existingChat) {
        return res.status(200).json({
          success: true,
          message: "Chat already exists",
          chat: existingChat
        });
      }
    }

    const chatData = {
      users,
      isGroupChat: isGroupChat || false,
      owner: currentUserId
    };

    if (isGroupChat) {
      chatData.chatName = chatName;
    }

    const chat = new Chat(chatData);
    await chat.save();

    // Populate users data
    await chat.populate('users', 'fullName profilePicture email status');

    res.status(201).json({
      success: true,
      message: "Chat created successfully",
      chat
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const getChats = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const chats = await Chat.find({ users: userId })
      .populate('users', 'fullName profilePicture email status')
      .populate('lastMessage')
      .populate('owner', 'fullName')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Chat.countDocuments({ users: userId });

    res.status(200).json({
      success: true,
      chats,
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

const getChatById = CatchAsyncError(async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.auth._id;

    const chat = await Chat.findOne({ 
      _id: chatId, 
      users: userId 
    })
      .populate('users', 'fullName profilePicture email status')
      .populate('owner', 'fullName');

    if (!chat) {
      return next(new Errors("Chat not found or access denied", 404));
    }

    res.status(200).json({
      success: true,
      chat
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const updateChat = CatchAsyncError(async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.auth._id;
    const { chatName, users } = req.body;

    const chat = await Chat.findOne({ 
      _id: chatId, 
      users: userId 
    });

    if (!chat) {
      return next(new Errors("Chat not found or access denied", 404));
    }

    // Only owner can update group chat
    if (chat.isGroupChat && chat.owner.toString() !== userId.toString()) {
      return next(new Errors("Only chat owner can update group chat", 403));
    }

    const updateData = {};
    if (chatName !== undefined) updateData.chatName = chatName;
    if (users !== undefined && chat.isGroupChat) {
      // Validate new users
      const existingUsers = await User.find({ _id: { $in: users } });
      if (existingUsers.length !== users.length) {
        return next(new Errors("One or more users do not exist", 400));
      }
      updateData.users = users;
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      updateData,
      { new: true }
    ).populate('users', 'fullName profilePicture email status');

    res.status(200).json({
      success: true,
      message: "Chat updated successfully",
      chat: updatedChat
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const deleteChat = CatchAsyncError(async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.auth._id;

    const chat = await Chat.findOne({ 
      _id: chatId, 
      users: userId 
    });

    if (!chat) {
      return next(new Errors("Chat not found or access denied", 404));
    }

    // Only owner can delete group chat
    if (chat.isGroupChat && chat.owner.toString() !== userId.toString()) {
      return next(new Errors("Only chat owner can delete group chat", 403));
    }

    // For direct chats, just remove user from participants
    if (!chat.isGroupChat) {
      chat.users = chat.users.filter(userId => userId.toString() !== userId.toString());
      if (chat.users.length === 0) {
        await Chat.findByIdAndDelete(chatId);
        // Also delete all messages in this chat
        await Message.deleteMany({ chat: chatId });
      } else {
        await chat.save();
      }
    } else {
      // For group chats, delete completely
      await Chat.findByIdAndDelete(chatId);
      await Message.deleteMany({ chat: chatId });
    }

    res.status(200).json({
      success: true,
      message: "Chat deleted successfully"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const addUserToChat = CatchAsyncError(async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.auth._id;
    const { userToAdd } = req.body;

    const chat = await Chat.findOne({ 
      _id: chatId, 
      users: userId 
    });

    if (!chat) {
      return next(new Errors("Chat not found or access denied", 404));
    }

    if (!chat.isGroupChat) {
      return next(new Errors("Cannot add users to direct chat", 400));
    }

    // Only owner can add users
    if (chat.owner.toString() !== userId.toString()) {
      return next(new Errors("Only chat owner can add users", 403));
    }

    // Check if user exists
    const user = await User.findById(userToAdd);
    if (!user) {
      return next(new Errors("User not found", 404));
    }

    // Check if user is already in chat
    if (chat.users.includes(userToAdd)) {
      return next(new Errors("User is already in this chat", 400));
    }

    chat.users.push(userToAdd);
    await chat.save();

    await chat.populate('users', 'fullName profilePicture email status');

    res.status(200).json({
      success: true,
      message: "User added to chat successfully",
      chat
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const removeUserFromChat = CatchAsyncError(async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.auth._id;
    const { userToRemove } = req.body;

    const chat = await Chat.findOne({ 
      _id: chatId, 
      users: userId 
    });

    if (!chat) {
      return next(new Errors("Chat not found or access denied", 404));
    }

    if (!chat.isGroupChat) {
      return next(new Errors("Cannot remove users from direct chat", 400));
    }

    // Only owner can remove users
    if (chat.owner.toString() !== userId.toString()) {
      return next(new Errors("Only chat owner can remove users", 403));
    }

    // Cannot remove owner
    if (userToRemove === chat.owner.toString()) {
      return next(new Errors("Cannot remove chat owner", 400));
    }

    chat.users = chat.users.filter(id => id.toString() !== userToRemove);
    await chat.save();

    await chat.populate('users', 'fullName profilePicture email status');

    res.status(200).json({
      success: true,
      message: "User removed from chat successfully",
      chat
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const leaveChat = CatchAsyncError(async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.auth._id;

    const chat = await Chat.findOne({ 
      _id: chatId, 
      users: userId 
    });

    if (!chat) {
      return next(new Errors("Chat not found or access denied", 404));
    }

    if (!chat.isGroupChat) {
      return next(new Errors("Cannot leave direct chat", 400));
    }

    // If user is owner, transfer ownership or delete chat
    if (chat.owner.toString() === userId.toString()) {
      if (chat.users.length > 1) {
        // Transfer ownership to another user
        const newOwner = chat.users.find(id => id.toString() !== userId.toString());
        chat.owner = newOwner;
      } else {
        // Delete chat if only owner remains
        await Chat.findByIdAndDelete(chatId);
        await Message.deleteMany({ chat: chatId });
        
        return res.status(200).json({
          success: true,
          message: "Chat deleted as you were the only member"
        });
      }
    }

    chat.users = chat.users.filter(id => id.toString() !== userId.toString());
    await chat.save();

    res.status(200).json({
      success: true,
      message: "Left chat successfully"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

export default {
  createChat,
  getChats,
  getChatById,
  updateChat,
  deleteChat,
  addUserToChat,
  removeUserFromChat,
  leaveChat
};
