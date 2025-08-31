// server/models/device.js

import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    deviceId: {
        type: String,
        required: true,
        index: true
    },
    deviceToken: {
        type: String,
        required: true
    },
    platform: {
        type: String,
        enum: ['ios', 'android'],
        required: true
    },
    deviceModel: String,
    systemVersion: String,
    appVersion: String,
    isValid: {
        type: Boolean,
        default: true
    },
    lastSeen: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Create a compound unique index on userId and deviceId
deviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

const Device = mongoose.model('Device', deviceSchema);
export default Device;