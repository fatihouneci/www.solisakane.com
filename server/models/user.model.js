
/**
 * @file user.model.js
 * @description
 * EN: This file defines the Mongoose schema and model for the User.
 * It includes fields for user profile, authentication, contact management, and notification settings.
 * FR: Ce fichier définit le schéma et le modèle Mongoose pour l'utilisateur.
 * Il inclut des champs pour le profil utilisateur, l'authentification, la gestion des contacts et les paramètres de notification.
 */
import mongoose from "mongoose"; // EN: Mongoose library / FR: Bibliothèque Mongoose
import bcrypt from "bcryptjs"; // EN: Library for hashing passwords / FR: Bibliothèque pour le hachage des mots de passe
import jwt from "jsonwebtoken"; // EN: JSON Web Token library / FR: Bibliothèque JSON Web Token

import config from "../config/config.js"; // EN: Server configuration / FR: Configuration du serveur
import Errors from "../helpers/Errors.js"; // EN: Custom error class / FR: Classe d'erreur personnalisée

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      // EN: This field is populated by a pre-save hook / FR: Ce champ est rempli par un hook de pré-sauvegarde
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    code: { // EN: Custom user code / FR: Code utilisateur personnalisé
      type: String,
      trim: true,
    },
    telephone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: "Email exist", // EN: Custom error message for unique validation / FR: Message d'erreur personnalisé pour la validation unique
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      // EN: Password hashing is handled by pre-save hook / FR: Le hachage du mot de passe est géré par un hook de pré-sauvegarde
    },
    profilePicture: {
      type: String,
    },
    coverPicture: { // EN: User's cover photo / FR: Photo de couverture de l'utilisateur
      type: String,
    },
    followers: { // EN: Array of user IDs who follow this user / FR: Tableau des ID d'utilisateurs qui suivent cet utilisateur
      type: Array,
      default: [],
    },
    // EN: Duplicate 'followers' field, likely a copy-paste error in original code / FR: Champ 'followers' en double, probablement une erreur de copier-coller dans le code original
    // followers: {
    //   type: Array,
    //   default: [],
    // },
    resetToken: { // EN: For password reset functionality / FR: Pour la fonctionnalité de réinitialisation de mot de passe
      token: String,
      expires: Date,
    },
    fcmToken: { // EN: Firebase Cloud Messaging token for push notifications / FR: Jeton Firebase Cloud Messaging pour les notifications push
      type: String,
      default: null
    },
    socketId: { // EN: Socket.IO ID for real-time communication / FR: ID Socket.IO pour la communication en temps réel
      type: String,
      default: null
    },
    online: { // EN: User online status / FR: Statut en ligne de l'utilisateur
      type : Boolean,
      default : false
    },
    isDeleted: { // EN: Soft delete flag / FR: Indicateur de suppression logique
      type : Boolean,
      default : false
    },
    status: { // EN: User's presence status / FR: Statut de présence de l'utilisateur
      type: String,
      enum: ['online', 'offline', 'away'],
      default: 'offline'
    },
    lastSeen : { // EN: Timestamp of last activity / FR: Horodatage de la dernière activité
      type : Date,
      default : Date.now
    },
    bio: {
      type: String,
      default: ''
    },
    contacts: [{ // EN: Array of user IDs in contact list / FR: Tableau des ID d'utilisateurs dans la liste de contacts
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    blockedUsers: [{ // EN: Array of user IDs blocked by this user / FR: Tableau des ID d'utilisateurs bloqués par cet utilisateur
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    notificationSettings: { // EN: User's notification preferences / FR: Préférences de notification de l'utilisateur
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
      emailNotifications: {
        type: Boolean,
        default: true
      },
      pushNotifications: {
        type: Boolean,
        default: true
      },
      soundEnabled: {
        type: Boolean,
        default: true
      },
      vibrationEnabled: {
        type: Boolean,
        default: true
      },
      doNotDisturb: { // EN: Do Not Disturb settings / FR: Paramètres Ne pas déranger
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
    },
    privacySettings: { // EN: User's privacy preferences / FR: Préférences de confidentialité de l'utilisateur
      showOnlineStatus: {
        type: Boolean,
        default: true
      },
      showLastSeen: {
        type: Boolean,
        default: true
      },
      showProfilePicture: {
        type: Boolean,
        default: true
      },
      allowMessagesFromStrangers: {
        type: Boolean,
        default: false
      },
      allowCallsFromStrangers: {
        type: Boolean,
        default: false
      },
      showReadReceipts: {
        type: Boolean,
        default: true
      },
      showTypingIndicator: {
        type: Boolean,
        default: true
      },
      allowContactDiscovery: {
        type: Boolean,
        default: true
      }
    },
    audioVideoSettings: { // EN: Audio and video call settings / FR: Paramètres d'appels audio et vidéo
      defaultCamera: {
        type: String,
        enum: ['front', 'back'],
        default: 'front'
      },
      defaultMicrophone: {
        type: String,
        default: 'default'
      },
      defaultSpeaker: {
        type: String,
        default: 'default'
      },
      videoQuality: {
        type: String,
        enum: ['low', 'medium', 'high', 'auto'],
        default: 'auto'
      },
      audioQuality: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'high'
      },
      noiseCancellation: {
        type: Boolean,
        default: true
      },
      echoCancellation: {
        type: Boolean,
        default: true
      },
      autoAnswer: {
        type: Boolean,
        default: false
      }
    },
    themeSettings: { // EN: Theme and appearance settings / FR: Paramètres de thème et d'apparence
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto'
      },
      primaryColor: {
        type: String,
        default: '#6366f1'
      },
      fontSize: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium'
      },
      language: {
        type: String,
        default: 'fr'
      },
      timezone: {
        type: String,
        default: 'Europe/Paris'
      },
      dateFormat: {
        type: String,
        default: 'DD/MM/YYYY'
      },
      timeFormat: {
        type: String,
        enum: ['12h', '24h'],
        default: '24h'
      }
    },
    securitySettings: { // EN: Security and authentication settings / FR: Paramètres de sécurité et d'authentification
      twoFactorAuth: {
        enabled: {
          type: Boolean,
          default: false
        },
        secret: {
          type: String,
          default: null
        },
        backupCodes: [{
          type: String
        }]
      },
      loginNotifications: {
        type: Boolean,
        default: true
      },
      sessionTimeout: {
        type: Number,
        default: 30 // EN: Minutes / FR: Minutes
      },
      requirePasswordForSensitiveActions: {
        type: Boolean,
        default: true
      },
      allowedDevices: [{
        deviceId: String,
        deviceName: String,
        lastUsed: Date,
        isTrusted: {
          type: Boolean,
          default: false
        }
      }]
    },
    dataSettings: { // EN: Data usage and storage settings / FR: Paramètres d'utilisation et de stockage des données
      autoDownloadMedia: {
        type: Boolean,
        default: false
      },
      compressImages: {
        type: Boolean,
        default: true
      },
      compressVideos: {
        type: Boolean,
        default: true
      },
      maxFileSize: {
        type: Number,
        default: 100 // EN: MB / FR: MB
      },
      dataSavingMode: {
        type: Boolean,
        default: false
      },
      syncFrequency: {
        type: String,
        enum: ['realtime', '5min', '15min', '30min', '1hour'],
        default: 'realtime'
      },
      autoBackup: {
        enabled: {
          type: Boolean,
          default: false
        },
        frequency: {
          type: String,
          enum: ['daily', 'weekly', 'monthly'],
          default: 'weekly'
        },
        lastBackup: {
          type: Date,
          default: null
        }
      }
    }
  },
  { timestamps: true } // EN: Adds createdAt and updatedAt timestamps / FR: Ajoute les horodatages createdAt et updatedAt
);

/**
 * EN: Instance method to sign an access token for the user.
 * FR: Méthode d'instance pour signer un jeton d'accès pour l'utilisateur.
 * @returns {string} The signed JWT access token. / Le jeton d'accès JWT signé.
 */
UserSchema.methods.signAccessToken = function () {
  return jwt.sign({ _id: this._id }, config.jwtSecret, {
    expiresIn: "3d", // EN: Token expires in 3 days / FR: Le jeton expire dans 3 jours
  });
};

/**
 * EN: Custom Schema method to authenticate a user by email and password or by ID.
 * FR: Méthode de schéma personnalisée pour authentifier un utilisateur par e-mail et mot de passe ou par ID.
 * @param {string} email - The user's email. / L'e-mail de l'utilisateur.
 * @param {string} password - The user's password. / Le mot de passe de l'utilisateur.
 * @param {string} [_id] - Optional user ID. / ID utilisateur facultatif.
 * @returns {Promise<User>} The authenticated user object. / L'objet utilisateur authentifié.
 * @throws {Errors} If user not found or credentials invalid. / Si l'utilisateur n'est pas trouvé ou les informations d'identification sont invalides.
 */
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

// EN: Pre-save hook to hash password and set fullName.
// FR: Hook de pré-sauvegarde pour hacher le mot de passe et définir le fullName.
UserSchema.pre("save", async function (next) {
  const user = this;
  if (user.firstName && user.lastName) {
    user.fullName = user.firstName + " " + user.lastName;
  }

  // EN: Only hash password if it has been modified / FR: Hacher le mot de passe uniquement s'il a été modifié
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

/**
 * EN: Static method to check if a user is online.
 * FR: Méthode statique pour vérifier si un utilisateur est en ligne.
 * @param {string} userId - The ID of the user to check. / L'ID de l'utilisateur à vérifier.
 * @returns {Promise<boolean>} True if the user is online, false otherwise. / Vrai si l'utilisateur est en ligne, sinon faux.
 */
UserSchema.statics.isUserOnline = async function(userId) {
  const user = await this.findById(userId);
  if (!user) return false;
  
  // EN: If user has a socket ID or last active time is within 5 minutes, consider them online
  // FR: Si l'utilisateur a un ID de socket ou si la dernière activité remonte à moins de 5 minutes, le considérer en ligne
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return user.socketId !== null || (user.status === 'online' && user.lastSeen > fiveMinutesAgo);
};

// EN: Another pre-save hook to hash password (duplicate, will keep for now as it's in original code)
// FR: Un autre hook de pré-sauvegarde pour hacher le mot de passe (duplicata, sera conservé pour l'instant car il est dans le code original)
UserSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;
