import Call from "../models/call.model.js";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import Errors from "../helpers/Errors.js";
import CatchAsyncError from "../helpers/CatchAsyncError.js";
import { v4 as uuidv4 } from 'uuid';

const initiateCall = CatchAsyncError(async (req, res, next) => {
  try {
    const { chatId, callType, recipientId } = req.body;
    const callerId = req.auth._id;

    // Validate required fields
    if (!chatId || !callType || !recipientId) {
      return next(new Errors("Chat ID, call type, and recipient ID are required", 400));
    }

    if (!['audio', 'video'].includes(callType)) {
      return next(new Errors("Call type must be 'audio' or 'video'", 400));
    }

    // Check if chat exists and user is a participant
    const chat = await Chat.findOne({ 
      _id: chatId, 
      users: { $all: [callerId, recipientId] } 
    });

    if (!chat) {
      return next(new Errors("Chat not found or recipient not in chat", 404));
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return next(new Errors("Recipient not found", 404));
    }

    // Check if there's already an active call in this chat
    const existingCall = await Call.findOne({
      chatId,
      status: { $in: ['initiated', 'ringing', 'accepted'] }
    });

    if (existingCall) {
      return next(new Errors("There is already an active call in this chat", 400));
    }

    // Generate unique call ID
    const callId = uuidv4();

    const callData = {
      chatId,
      callId,
      callerId,
      callType,
      status: 'initiated',
      metadata: {
        callerDevice: req.headers['user-agent'] || 'unknown',
        recipientDevice: 'unknown'
      }
    };

    const call = new Call(callData);
    await call.save();

    // Update chat with ongoing call info
    await Chat.findByIdAndUpdate(chatId, {
      'ongoingCall.callId': call._id,
      'ongoingCall.chatId': chatId,
      'ongoingCall.callerId': callerId,
      'ongoingCall.cameraStatus': callType === 'video',
      'ongoingCall.microphoneStatus': true,
      'ongoingCall.startedAt': new Date()
    });

    // Populate call data
    await call.populate([
      { path: 'callerId', select: 'fullName profilePicture email' },
      { path: 'chatId', select: 'users isGroupChat chatName' }
    ]);

    res.status(201).json({
      success: true,
      message: "Call initiated successfully",
      call
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const answerCall = CatchAsyncError(async (req, res, next) => {
  try {
    const { callId } = req.params;
    const userId = req.auth._id;

    const call = await Call.findOne({ callId });

    if (!call) {
      return next(new Errors("Call not found", 404));
    }

    // Check if user is the intended recipient
    const chat = await Chat.findOne({ 
      _id: call.chatId, 
      users: userId 
    });

    if (!chat) {
      return next(new Errors("Access denied", 403));
    }

    // Check if call is in correct state
    if (!['initiated', 'ringing'].includes(call.status)) {
      return next(new Errors("Call is not in a state that can be answered", 400));
    }

    // Update call status
    await call.updateStatus('accepted');

    // Update chat ongoing call status
    await Chat.findByIdAndUpdate(call.chatId, {
      'ongoingCall.cameraStatus': call.callType === 'video',
      'ongoingCall.microphoneStatus': true
    });

    await call.populate([
      { path: 'callerId', select: 'fullName profilePicture email' },
      { path: 'chatId', select: 'users isGroupChat chatName' }
    ]);

    res.status(200).json({
      success: true,
      message: "Call answered successfully",
      call
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const declineCall = CatchAsyncError(async (req, res, next) => {
  try {
    const { callId } = req.params;
    const userId = req.auth._id;

    const call = await Call.findOne({ callId });

    if (!call) {
      return next(new Errors("Call not found", 404));
    }

    // Check if user is the intended recipient
    const chat = await Chat.findOne({ 
      _id: call.chatId, 
      users: userId 
    });

    if (!chat) {
      return next(new Errors("Access denied", 403));
    }

    // Update call status
    await call.updateStatus('declined');

    // Clear ongoing call from chat
    await Chat.findByIdAndUpdate(call.chatId, {
      $unset: { ongoingCall: 1 }
    });

    res.status(200).json({
      success: true,
      message: "Call declined successfully",
      call
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const endCall = CatchAsyncError(async (req, res, next) => {
  try {
    const { callId } = req.params;
    const userId = req.auth._id;

    const call = await Call.findOne({ callId });

    if (!call) {
      return next(new Errors("Call not found", 404));
    }

    // Check if user is a participant in the call
    const chat = await Chat.findOne({ 
      _id: call.chatId, 
      users: userId 
    });

    if (!chat) {
      return next(new Errors("Access denied", 403));
    }

    // Update call status
    await call.updateStatus('ended');

    // Clear ongoing call from chat
    await Chat.findByIdAndUpdate(call.chatId, {
      $unset: { ongoingCall: 1 }
    });

    await call.populate([
      { path: 'callerId', select: 'fullName profilePicture email' },
      { path: 'chatId', select: 'users isGroupChat chatName' }
    ]);

    res.status(200).json({
      success: true,
      message: "Call ended successfully",
      call
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const getCallHistory = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;

    const query = {
      $or: [
        { callerId: userId },
        { recipientId: userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    const calls = await Call.find(query)
      .populate('callerId', 'fullName profilePicture email')
      .populate('chatId', 'users isGroupChat chatName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Call.countDocuments(query);

    res.status(200).json({
      success: true,
      calls,
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

const getCallStats = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const period = parseInt(req.query.period) || 30; // days

    const stats = await Call.getCallStats(userId, period);

    // Calculate additional statistics
    const totalCalls = stats.reduce((sum, stat) => sum + stat.count, 0);
    const totalDuration = stats.reduce((sum, stat) => sum + (stat.totalDuration || 0), 0);
    const successfulCalls = stats.find(stat => stat._id === 'ended')?.count || 0;
    const missedCalls = stats.find(stat => stat._id === 'missed')?.count || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalCalls,
        totalDuration,
        successfulCalls,
        missedCalls,
        successRate: totalCalls > 0 ? ((successfulCalls / totalCalls) * 100).toFixed(2) : 0,
        averageDuration: successfulCalls > 0 ? (totalDuration / successfulCalls).toFixed(2) : 0,
        breakdown: stats
      }
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const handleIceCandidate = CatchAsyncError(async (req, res, next) => {
  try {
    const { callId } = req.params;
    const { candidate } = req.body;
    const userId = req.auth._id;

    const call = await Call.findOne({ callId });

    if (!call) {
      return next(new Errors("Call not found", 404));
    }

    // Check if user is a participant in the call
    const chat = await Chat.findOne({ 
      _id: call.chatId, 
      users: userId 
    });

    if (!chat) {
      return next(new Errors("Access denied", 403));
    }

    // Store ICE candidate (in a real implementation, you might want to store this differently)
    if (!call.signalData) {
      call.signalData = {};
    }
    if (!call.signalData.iceCandidates) {
      call.signalData.iceCandidates = [];
    }
    call.signalData.iceCandidates.push({
      candidate,
      userId,
      timestamp: new Date()
    });

    await call.save();

    res.status(200).json({
      success: true,
      message: "ICE candidate received"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const handleSdpOffer = CatchAsyncError(async (req, res, next) => {
  try {
    const { callId } = req.params;
    const { sdp, type } = req.body;
    const userId = req.auth._id;

    const call = await Call.findOne({ callId });

    if (!call) {
      return next(new Errors("Call not found", 404));
    }

    // Check if user is a participant in the call
    const chat = await Chat.findOne({ 
      _id: call.chatId, 
      users: userId 
    });

    if (!chat) {
      return next(new Errors("Access denied", 403));
    }

    // Store SDP offer/answer
    if (!call.signalData) {
      call.signalData = {};
    }
    call.signalData[type] = {
      sdp,
      userId,
      timestamp: new Date()
    };

    await call.save();

    res.status(200).json({
      success: true,
      message: `${type} received successfully`
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

const updateCallQuality = CatchAsyncError(async (req, res, next) => {
  try {
    const { callId } = req.params;
    const { audioScore, videoScore, networkQuality } = req.body;
    const userId = req.auth._id;

    const call = await Call.findOne({ callId });

    if (!call) {
      return next(new Errors("Call not found", 404));
    }

    // Check if user is a participant in the call
    const chat = await Chat.findOne({ 
      _id: call.chatId, 
      users: userId 
    });

    if (!chat) {
      return next(new Errors("Access denied", 403));
    }

    // Update quality metrics
    if (audioScore !== undefined) {
      call.quality.audioScore = audioScore;
    }
    if (videoScore !== undefined) {
      call.quality.videoScore = videoScore;
    }
    if (networkQuality !== undefined) {
      call.quality.networkQuality = networkQuality;
    }

    await call.save();

    res.status(200).json({
      success: true,
      message: "Call quality updated successfully"
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
  getCallStats,
  handleIceCandidate,
  handleSdpOffer,
  updateCallQuality
};
