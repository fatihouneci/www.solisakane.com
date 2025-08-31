import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import config from "../config/config.js";
import Errors from "../helpers/Errors.js";

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    code: {
      type: String,
      trim: true,
    },
    telephone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: "Email exist",
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    coverPicture: {
      type: String,
    },
    followers: {
      type: Array,
      default: [],
    },
    followers: {
      type: Array,
      default: [],
    },
    resetToken: {
      token: String,
      expires: Date,
    },
    fcmToken: {
      type: String,
      default: null
    },
    socketId: {
      type: String,
      default: null
    },
    online: {
      type : Boolean,
      default : false
    },
    isDeleted: {
      type : Boolean,
      default : false
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'away'],
      default: 'offline'
    },
    lastSeen : {
      type : Date,
      default : Date.now
    },
    bio: {
      type: String,
      default: ''
    },
    contacts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    blockedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    notificationSettings: {
          messageNotifications: {
        type: Boolean,
        default: true
      },
      callNotifications: {
        type: Boolean,
        default: true
      },
      groupNotifications: {
        type: Boolean,
        default: true
      },
      doNotDisturb: {
        enabled: {
          type: Boolean,
          default: false
        },
        startTime: {
          type: String,
          default: '22:00' // 10:00 PM
        },
        endTime: {
          type: String,
          default: '08:00' // 8:00 AM
        }
      }
    }
  },
  { timestamps: true }
);

UserSchema.methods.signAccessToken = function () {
  return jwt.sign({ _id: this._id }, config.jwtSecret, {
    expiresIn: "3d",
  });
};

// Custom Schema functions
UserSchema.methods.authenticate = async (email, password, _id) => {
  let user = null;

  if (_id) {
    user = await User.findOne({ _id, email });
  } else {
    user = await User.findOne({ email });
  }

  if (!user) return new Errors("Cet utilisateur n'existe pas !", 400);

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid)
    return new Errors("Les informations renseignées sont invalides !", 400); //Les informations renseignées sont invalides

  return user;
};

UserSchema.pre("save", async function (next) {
  const user = this;
  if (user.firstName && user.lastName) {
    user.fullName = user.firstName + " " + user.lastName;
  }

  if (user.isModified("password")) {
    user.password = bcrypt.hash(user.password, 8);
  }

  next();
});

// Static method to check if user is online
UserSchema.statics.isUserOnline = async function(userId) {
  const user = await this.findById(userId);
  if (!user) return false;
  
  // If user has a socket ID or last active time is within 5 minutes, consider them online
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return user.socketId !== null || (user.status === 'online' && user.lastSeen > fiveMinutesAgo);
};

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;



// server/models/user.js

// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//     lowercase: true
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 6
//   },
//   profilePicture: {
//     type: String,
//     default: ''
//   },
//   status: {
//     type: String,
//     enum: ['online', 'offline', 'away'],
//     default: 'offline'
//   },
//   lastActive: {
//     type: Date,
//     default: Date.now
//   },
//   socketId: {
//     type: String,
//     default: null
//   },
//   fcmToken: String,
//   bio: {
//     type: String,
//     default: ''
//   },
//   contacts: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }],
//   blockedUsers: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }],
//   notificationSettings: {
//     messageNotifications: {
//       type: Boolean,
//       default: true
//     },
//     callNotifications: {
//       type: Boolean,
//       default: true
//     },
//     groupNotifications: {
//       type: Boolean,
//       default: true
//     },
//     doNotDisturb: {
//       enabled: {
//         type: Boolean,
//         default: false
//       },
//       startTime: {
//         type: String,
//         default: '22:00' // 10:00 PM
//       },
//       endTime: {
//         type: String,
//         default: '08:00' // 8:00 AM
//       }
//     }
//   }
// }, { timestamps: true });

// // Pre-save hook to hash password
// userSchema.pre('save', async function(next) {
//   const user = this;
//   if (user.isModified('password')) {
//     user.password = await bcrypt.hash(user.password, 8);
//   }
//   next();
// });

// // Method to compare password for login
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // Method to generate auth token (to be implemented with JWT)
// userSchema.methods.generateAuthToken = async function() {
//   // This would be implemented with JWT
//   // const token = jwt.sign({ id: this._id.toString() }, process.env.JWT_SECRET);
//   // return token;
// };

// // Method to return user public profile (excludes sensitive information)
// userSchema.methods.getPublicProfile = function() {
//   const user = this.toObject();
//   delete user.password;
//   delete user.socketId;
//   delete user.fcmToken;
//   delete user.blockedUsers;
//   return user;
// };

// // Static method to check if user is online
// userSchema.statics.isUserOnline = async function(userId) {
//   const user = await this.findById(userId);
//   if (!user) return false;
  
//   // If user has a socket ID or last active time is within 5 minutes, consider them online
//   const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
//   return user.socketId !== null || (user.status === 'online' && user.lastActive > fiveMinutesAgo);
// };

// // Method to check if user has blocked another user
// userSchema.methods.hasBlocked = function(userId) {
//   return this.blockedUsers.some(blockedId => blockedId.toString() === userId.toString());
// };

// // Method to check if user can receive notification (based on DND settings)
// userSchema.methods.canReceiveNotification = function(notificationType) {
//   // Check notification type settings
//   if (!this.notificationSettings[notificationType + 'Notifications']) {
//     return false;
//   }
  
//   // Check Do Not Disturb settings
//   if (this.notificationSettings.doNotDisturb.enabled) {
//     const now = new Date();
//     const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
//                         now.getMinutes().toString().padStart(2, '0');
//     const startTime = this.notificationSettings.doNotDisturb.startTime;
//     const endTime = this.notificationSettings.doNotDisturb.endTime;
    
//     // Handle cases like 22:00 - 08:00 (evening to morning)
//     if (startTime > endTime) {
//       if (currentTime >= startTime || currentTime < endTime) {
//         return false;
//       }
//     } else {
//       // Handle cases like 08:00 - 12:00 (morning to afternoon)
//       if (currentTime >= startTime && currentTime < endTime) {
//         return false;
//       }
//     }
//   }
  
//   return true;
// };

// const User = mongoose.model('User', userSchema);

// module.exports = User;