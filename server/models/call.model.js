
/**
 * @file call.model.js
 * @description
 * EN: This file defines the Mongoose schema and model for a Call.
 * It stores comprehensive information about voice or video calls within the application,
 * including participants, status, duration, and WebRTC-related details.
 * FR: Ce fichier définit le schéma et le modèle Mongoose pour un Appel.
 * Il stocke des informations complètes sur les appels vocaux ou vidéo au sein de l'application,
 * y compris les participants, le statut, la durée et les détails liés à WebRTC.
 */
import mongoose from "mongoose"; // EN: Mongoose library / FR: Bibliothèque Mongoose

const CallSchema = new mongoose.Schema({
  chatId: { // EN: Reference to the Chat associated with this call / FR: Référence au Chat associé à cet appel
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  callId: { // EN: Unique identifier for the call / FR: Identifiant unique de l'appel
    type: String,
    required: true,
    unique: true,
    index: true
  },
  callerId: { // EN: Reference to the User who initiated the call / FR: Référence à l'utilisateur qui a initié l'appel
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  callType: { // EN: Type of call (e.g., 'audio', 'video') / FR: Type d'appel (ex: 'audio', 'vidéo')
    type: String,
    enum: ['audio', 'video'],
    required: true
  },
  status: { // EN: Status of the call / FR: Statut de l'appel
    type: String,
    enum: ['initiated', 'ringing', 'accepted', 'declined', 'missed', 'ended', 'failed'],
    default: 'initiated'
  },
  startedAt: { // EN: Timestamp when the call was initiated / FR: Horodatage de l'initiation de l'appel
    type: Date,
    default: Date.now
  },
  answeredAt: { // EN: Timestamp when the call was answered / FR: Horodatage de la réponse à l'appel
    type: Date
  },
  endedAt: { // EN: Timestamp when the call ended / FR: Horodatage de la fin de l'appel
    type: Date
  },
  duration: { // EN: Duration of the call in seconds / FR: Durée de l'appel en secondes
    type: Number,
    default: 0
  },
  mediaConnectionId: String, // EN: ID for WebRTC connection / FR: ID pour la connexion WebRTC
  signalData: Object, // EN: Store signaling data if needed / FR: Stocker les données de signalisation si nécessaire
  iceServers: Array, // EN: STUN/TURN server configurations / FR: Configurations des serveurs STUN/TURN
  recordings: [{ // EN: Array of call recordings / FR: Tableau des enregistrements d'appels
    recordingId: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    format: {
      type: String,
      enum: ['mp3', 'wav', 'webm', 'mp4'],
      default: 'webm'
    },
    quality: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    isEncrypted: {
      type: Boolean,
      default: false
    },
    encryptionKey: {
      type: String,
      default: null
    },
    participants: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      audioTrack: {
        type: String,
        default: null
      },
      videoTrack: {
        type: String,
        default: null
      }
    }],
    metadata: {
      startTime: {
        type: Date,
        required: true
      },
      endTime: {
        type: Date,
        required: true
      },
      recordingType: {
        type: String,
        enum: ['audio', 'video', 'screen'],
        default: 'audio'
      },
      resolution: {
        width: Number,
        height: Number
      },
      bitrate: Number,
      sampleRate: Number,
      channels: Number
    },
    permissions: {
      canDownload: {
        type: Boolean,
        default: true
      },
      canShare: {
        type: Boolean,
        default: false
      },
      canDelete: {
        type: Boolean,
        default: true
      },
      expiresAt: {
        type: Date,
        default: null
      }
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    lastAccessed: {
      type: Date,
      default: Date.now
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  recordingSettings: { // EN: Call recording settings / FR: Paramètres d'enregistrement d'appel
    enabled: {
      type: Boolean,
      default: false
    },
    autoRecord: {
      type: Boolean,
      default: false
    },
    requireConsent: {
      type: Boolean,
      default: true
    },
    consentGiven: {
      type: Boolean,
      default: false
    },
    consentTimestamp: {
      type: Date,
      default: null
    },
    quality: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    format: {
      type: String,
      enum: ['mp3', 'wav', 'webm', 'mp4'],
      default: 'webm'
    },
    maxDuration: {
      type: Number,
      default: 3600 // EN: 1 hour in seconds / FR: 1 heure en secondes
    },
    storageLocation: {
      type: String,
      enum: ['local', 'cloud', 'both'],
      default: 'local'
    }
  },
  quality: { // EN: Call quality metrics / FR: Métriques de qualité d'appel
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
  metadata: { // EN: Additional call metadata / FR: Métadonnées d'appel supplémentaires
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
}, { timestamps: true }); // EN: Adds createdAt and updatedAt timestamps / FR: Ajoute les horodatages createdAt et updatedAt

// EN: Pre-save hook to calculate call duration when 'endedAt' is modified.
// FR: Hook de pré-sauvegarde pour calculer la durée de l'appel lorsque 'endedAt' est modifié.
CallSchema.pre('save', function(next) {
  const call = this;
  
  // EN: Calculate duration if call has started and ended / FR: Calculer la durée si l'appel a commencé et s'est terminé
  if (call.isModified('endedAt') && call.endedAt && call.answeredAt) {
    call.duration = Math.round((call.endedAt - call.answeredAt) / 1000);
  }
  
  next();
});

/**
 * EN: Instance method to get public details of a call (excluding sensitive data).
 * FR: Méthode d'instance pour obtenir les détails publics d'un appel (excluant les données sensibles).
 * @returns {object} The call object with sensitive data removed. / L'objet appel avec les données sensibles supprimées.
 */
CallSchema.methods.getPublicDetails = function() {
  const call = this.toObject();
  delete call.signalData;
  delete call.iceServers;
  return call;
};

/**
 * EN: Static method to find active calls for a specific user.
 * FR: Méthode statique pour trouver les appels actifs pour un utilisateur spécifique.
 * @param {string} userId - The ID of the user. / L'ID de l'utilisateur.
 * @returns {Promise<Call[]>} A promise that resolves with an array of active call objects. / Une promesse qui se résout avec un tableau d'objets d'appels actifs.
 */
CallSchema.statics.findActiveCallsForUser = async function(userId) {
  return this.find({
    $or: [
      { callerId: userId },
      { recipientId: userId }
    ],
    status: { $in: ['initiated', 'ringing', 'accepted'] } // EN: Active call statuses / FR: Statuts d'appel actifs
  }).sort({ startedAt: -1 }); // EN: Sort by most recent calls / FR: Trier par les appels les plus récents
};

/**
 * EN: Static method to get call statistics for a user over a period.
 * FR: Méthode statique pour obtenir les statistiques d'appel pour un utilisateur sur une période donnée.
 * @param {string} userId - The ID of the user. / L'ID de l'utilisateur.
 * @param {number} [period=30] - The number of days to look back for statistics. / Le nombre de jours à prendre en compte pour les statistiques.
 * @returns {Promise<object[]>} A promise that resolves with an array of call statistics grouped by status. / Une promesse qui se résout avec un tableau de statistiques d'appels regroupées par statut.
 */
CallSchema.statics.getCallStats = async function(userId, period = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);
  
  const stats = await this.aggregate([
    {
      $match: {
        $or: [
          { callerId: mongoose.Types.ObjectId(userId) },
          { recipientId: mongoose.Types.ObjectId(userId) }
        ],
        createdAt: { $gte: startDate } // EN: Filter by creation date / FR: Filtrer par date de création
      }
    },
    {
      $group: {
        _id: '$status', // EN: Group by call status / FR: Grouper par statut d'appel
        count: { $sum: 1 }, // EN: Count calls in each status / FR: Compter les appels dans chaque statut
        totalDuration: { $sum: '$duration' } // EN: Sum of durations for each status / FR: Somme des durées pour chaque statut
      }
    }
  ]);
  
  return stats;
};

/**
 * EN: Instance method to update the status of a call.
 * FR: Méthode d'instance pour mettre à jour le statut d'un appel.
 * @param {string} status - The new status of the call. / Le nouveau statut de l'appel.
 * @returns {Promise<Call>} A promise that resolves with the updated call object. / Une promesse qui se résout avec l'objet appel mis à jour.
 */
CallSchema.methods.updateStatus = async function(status) {
  this.status = status;
  
  // EN: Set answeredAt if status becomes 'accepted' and it's not already set
  // FR: Définir answeredAt si le statut devient 'accepted' et qu'il n'est pas déjà défini
  if (status === 'accepted' && !this.answeredAt) {
    this.answeredAt = new Date();
  }
  
  // EN: Set endedAt if status indicates call termination and it's not already set
  // FR: Définir endedAt si le statut indique la fin de l'appel et qu'il n'est pas déjà défini
  if (['declined', 'missed', 'ended', 'failed'].includes(status) && !this.endedAt) {
    this.endedAt = new Date();
  }
  
  return await this.save();
};

const Call = mongoose.model('Call', CallSchema); // EN: Create the Call model / FR: Créer le modèle Call

export default Call;
