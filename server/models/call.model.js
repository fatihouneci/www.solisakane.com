// server/models/call.js

import mongoose from "mongoose";

const callSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  callId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  callerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  callType: {
    type: String,
    enum: ['audio', 'video'],
    required: true
  },
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'accepted', 'declined', 'missed', 'ended', 'failed'],
    default: 'initiated'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  answeredAt: {
    type: Date
  },
  endedAt: {
    type: Date
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  mediaConnectionId: String, // For WebRTC connection ID
  signalData: Object, // Store signaling data if needed
  iceServers: Array, // STUN/TURN server configurations
  recordings: [{
    url: String,
    duration: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  quality: {
    audioScore: {
      type: Number,
      min: 0,
      max: 100
    },
    videoScore: {
      type: Number,
      min: 0,
      max: 100
    },
    networkQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    }
  },
  metadata: {
    endReason: {
      type: String,
      enum: ['normal', 'error', 'timeout', 'user_busy', 'network_error', 'no_answer', 'declined', null],
      default: null
    },
    callerDevice: {
      type: String,
      default: 'unknown'
    },
    recipientDevice: {
      type: String,
      default: 'unknown'
    },
    retries: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

// Pre-save hook to calculate duration
callSchema.pre('save', function(next) {
  const call = this;
  
  // Calculate duration if call has started and ended
  if (call.isModified('endedAt') && call.endedAt && call.answeredAt) {
    call.duration = Math.round((call.endedAt - call.answeredAt) / 1000);
  }
  
  next();
});

// Method to get call details for frontend
callSchema.methods.getPublicDetails = function() {
  const call = this.toObject();
  delete call.signalData;
  delete call.iceServers;
  return call;
};

// Static method to find active calls for a user
callSchema.statics.findActiveCallsForUser = async function(userId) {
  return this.find({
    $or: [
      { callerId: userId },
      { recipientId: userId }
    ],
    status: { $in: ['initiated', 'ringing', 'accepted'] }
  }).sort({ startedAt: -1 });
};

// Static method to get call statistics for a user
callSchema.statics.getCallStats = async function(userId, period = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);
  
  const stats = await this.aggregate([
    {
      $match: {
        $or: [
          { callerId: mongoose.Types.ObjectId(userId) },
          { recipientId: mongoose.Types.ObjectId(userId) }
        ],
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalDuration: { $sum: '$duration' }
      }
    }
  ]);
  
  return stats;
};

// Method to update call status
callSchema.methods.updateStatus = async function(status) {
  this.status = status;
  
  if (status === 'accepted' && !this.answeredAt) {
    this.answeredAt = new Date();
  }
  
  if (['declined', 'missed', 'ended', 'failed'].includes(status) && !this.endedAt) {
    this.endedAt = new Date();
  }
  
  return await this.save();
};

const Call = mongoose.model('Call', callSchema);

export default Call;