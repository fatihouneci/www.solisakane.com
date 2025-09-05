/**
 * @file meeting.model.js
 * @description
 * EN: This file defines the Mongoose schema and model for Meetings.
 * It stores information about scheduled meetings, video conferences, and appointments.
 * FR: Ce fichier définit le schéma et le modèle Mongoose pour les Réunions.
 * Il stocke les informations sur les réunions programmées, conférences vidéo et rendez-vous.
 */
import mongoose from "mongoose"; // EN: Mongoose library / FR: Bibliothèque Mongoose

const MeetingSchema = new mongoose.Schema({
  title: { // EN: Meeting title / FR: Titre de la réunion
    type: String,
    required: true,
    maxlength: 200
  },
  description: { // EN: Meeting description / FR: Description de la réunion
    type: String,
    maxlength: 1000
  },
  organizerId: { // EN: Reference to the User who organized the meeting / FR: Référence à l'utilisateur qui a organisé la réunion
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  participants: [{ // EN: Meeting participants / FR: Participants de la réunion
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['organizer', 'presenter', 'attendee', 'observer'],
      default: 'attendee'
    },
    status: {
      type: String,
      enum: ['invited', 'accepted', 'declined', 'tentative', 'no_response'],
      default: 'invited'
    },
    responseAt: Date, // EN: When they responded / FR: Quand ils ont répondu
    joinedAt: Date, // EN: When they joined the meeting / FR: Quand ils ont rejoint la réunion
    leftAt: Date, // EN: When they left the meeting / FR: Quand ils ont quitté la réunion
    isPresent: {
      type: Boolean,
      default: false
    }
  }],
  scheduledStart: { // EN: Scheduled start time / FR: Heure de début programmée
    type: Date,
    required: true,
    index: true
  },
  scheduledEnd: { // EN: Scheduled end time / FR: Heure de fin programmée
    type: Date,
    required: true
  },
  actualStart: { // EN: Actual start time / FR: Heure de début réelle
    type: Date
  },
  actualEnd: { // EN: Actual end time / FR: Heure de fin réelle
    type: Date
  },
  duration: { // EN: Meeting duration in minutes / FR: Durée de la réunion en minutes
    type: Number,
    default: 60
  },
  status: { // EN: Meeting status / FR: Statut de la réunion
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'postponed'],
    default: 'scheduled',
    index: true
  },
  type: { // EN: Meeting type / FR: Type de réunion
    type: String,
    enum: ['video_call', 'audio_call', 'in_person', 'hybrid'],
    default: 'video_call'
  },
  location: { // EN: Meeting location / FR: Lieu de la réunion
    physical: {
      name: String,
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      room: String,
      building: String
    },
    virtual: {
      platform: {
        type: String,
        enum: ['solisakane', 'zoom', 'teams', 'google_meet', 'webex', 'other'],
        default: 'solisakane'
      },
      meetingId: String,
      meetingUrl: String,
      password: String,
      dialInNumbers: [{
        country: String,
        number: String,
        accessCode: String
      }]
    }
  },
  agenda: [{ // EN: Meeting agenda items / FR: Points de l'ordre du jour
    title: {
      type: String,
      required: true
    },
    description: String,
    duration: Number, // EN: Duration in minutes / FR: Durée en minutes
    presenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    order: Number,
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  recordings: [{ // EN: Meeting recordings / FR: Enregistrements de la réunion
    recordingId: String,
    url: String,
    filename: String,
    duration: Number,
    size: Number,
    format: String,
    quality: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  chat: { // EN: Associated chat for the meeting / FR: Chat associé à la réunion
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat'
    },
    isEnabled: {
      type: Boolean,
      default: true
    }
  },
  reminders: [{ // EN: Meeting reminders / FR: Rappels de réunion
    type: {
      type: String,
      enum: ['email', 'push', 'sms', 'in_app'],
      required: true
    },
    scheduledFor: {
      type: Date,
      required: true
    },
    isSent: {
      type: Boolean,
      default: false
    },
    sentAt: Date
  }],
  settings: { // EN: Meeting settings / FR: Paramètres de la réunion
    allowJoinBeforeHost: {
      type: Boolean,
      default: true
    },
    muteOnEntry: {
      type: Boolean,
      default: false
    },
    videoOnEntry: {
      type: Boolean,
      default: true
    },
    allowScreenShare: {
      type: Boolean,
      default: true
    },
    allowChat: {
      type: Boolean,
      default: true
    },
    allowRecording: {
      type: Boolean,
      default: false
    },
    requirePassword: {
      type: Boolean,
      default: false
    },
    waitingRoom: {
      type: Boolean,
      default: false
    },
    maxParticipants: {
      type: Number,
      default: 100
    }
  },
  recurrence: { // EN: Meeting recurrence settings / FR: Paramètres de récurrence de la réunion
    isRecurring: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'weekly'
    },
    interval: {
      type: Number,
      default: 1 // EN: Every X days/weeks/months / FR: Tous les X jours/semaines/mois
    },
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6 // EN: 0 = Sunday, 6 = Saturday / FR: 0 = Dimanche, 6 = Samedi
    }],
    endDate: Date,
    occurrences: Number, // EN: Number of occurrences / FR: Nombre d'occurrences
    parentMeetingId: { // EN: Reference to parent meeting for recurring meetings / FR: Référence à la réunion parent pour les réunions récurrentes
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meeting'
    }
  },
  metadata: { // EN: Additional metadata / FR: Métadonnées supplémentaires
    tags: [String],
    category: {
      type: String,
      enum: ['work', 'personal', 'education', 'health', 'social', 'other'],
      default: 'work'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    timezone: {
      type: String,
      default: 'Europe/Paris'
    },
    language: {
      type: String,
      default: 'fr'
    },
    notes: String, // EN: Additional notes / FR: Notes supplémentaires
    attachments: [{
      fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
      },
      name: String,
      size: Number,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, { 
  timestamps: true // EN: Adds createdAt and updatedAt timestamps / FR: Ajoute les horodatages createdAt et updatedAt
});

// EN: Indexes for better performance / FR: Index pour de meilleures performances
MeetingSchema.index({ organizerId: 1, scheduledStart: -1 });
MeetingSchema.index({ 'participants.userId': 1, scheduledStart: -1 });
MeetingSchema.index({ status: 1, scheduledStart: 1 });
MeetingSchema.index({ scheduledStart: 1, scheduledEnd: 1 });

// EN: Pre-save hook to calculate duration / FR: Hook de pré-sauvegarde pour calculer la durée
MeetingSchema.pre('save', function(next) {
  if (this.scheduledStart && this.scheduledEnd) {
    this.duration = Math.round((this.scheduledEnd - this.scheduledStart) / (1000 * 60)); // EN: Convert to minutes / FR: Convertir en minutes
  }
  next();
});

/**
 * EN: Instance method to add a participant
 * FR: Méthode d'instance pour ajouter un participant
 * @param {string} userId - The user ID / L'ID utilisateur
 * @param {string} role - The participant role / Le rôle du participant
 * @returns {Promise<Meeting>} The updated meeting / La réunion mise à jour
 */
MeetingSchema.methods.addParticipant = async function(userId, role = 'attendee') {
  // EN: Check if user is already a participant / FR: Vérifier si l'utilisateur est déjà participant
  const existingParticipant = this.participants.find(p => p.userId.toString() === userId);
  if (!existingParticipant) {
    this.participants.push({
      userId,
      role,
      status: 'invited'
    });
    return await this.save();
  }
  return this;
};

/**
 * EN: Instance method to remove a participant
 * FR: Méthode d'instance pour supprimer un participant
 * @param {string} userId - The user ID / L'ID utilisateur
 * @returns {Promise<Meeting>} The updated meeting / La réunion mise à jour
 */
MeetingSchema.methods.removeParticipant = async function(userId) {
  this.participants = this.participants.filter(p => p.userId.toString() !== userId);
  return await this.save();
};

/**
 * EN: Instance method to update participant status
 * FR: Méthode d'instance pour mettre à jour le statut du participant
 * @param {string} userId - The user ID / L'ID utilisateur
 * @param {string} status - The new status / Le nouveau statut
 * @returns {Promise<Meeting>} The updated meeting / La réunion mise à jour
 */
MeetingSchema.methods.updateParticipantStatus = async function(userId, status) {
  const participant = this.participants.find(p => p.userId.toString() === userId);
  if (participant) {
    participant.status = status;
    participant.responseAt = new Date();
    return await this.save();
  }
  return this;
};

/**
 * EN: Instance method to start the meeting
 * FR: Méthode d'instance pour démarrer la réunion
 * @returns {Promise<Meeting>} The updated meeting / La réunion mise à jour
 */
MeetingSchema.methods.startMeeting = async function() {
  this.status = 'in_progress';
  this.actualStart = new Date();
  return await this.save();
};

/**
 * EN: Instance method to end the meeting
 * FR: Méthode d'instance pour terminer la réunion
 * @returns {Promise<Meeting>} The updated meeting / La réunion mise à jour
 */
MeetingSchema.methods.endMeeting = async function() {
  this.status = 'completed';
  this.actualEnd = new Date();
  
  // EN: Mark all participants as not present / FR: Marquer tous les participants comme non présents
  this.participants.forEach(participant => {
    participant.isPresent = false;
    if (!participant.leftAt) {
      participant.leftAt = new Date();
    }
  });
  
  return await this.save();
};

/**
 * EN: Static method to get user meetings
 * FR: Méthode statique pour récupérer les réunions de l'utilisateur
 * @param {string} userId - The user ID / L'ID utilisateur
 * @param {object} options - Query options / Options de requête
 * @returns {Promise<Meeting[]>} Array of meetings / Tableau de réunions
 */
MeetingSchema.statics.getUserMeetings = async function(userId, options = {}) {
  const {
    startDate = new Date(),
    endDate = null,
    status = null,
    limit = 20,
    skip = 0
  } = options;

  const query = {
    $or: [
      { organizerId: userId },
      { 'participants.userId': userId }
    ]
  };

  if (startDate) {
    query.scheduledStart = { $gte: startDate };
  }

  if (endDate) {
    query.scheduledEnd = { $lte: endDate };
  }

  if (status) {
    query.status = status;
  }

  return this.find(query)
    .populate('organizerId', 'firstName lastName email profilePicture')
    .populate('participants.userId', 'firstName lastName email profilePicture')
    .sort({ scheduledStart: 1 })
    .limit(limit)
    .skip(skip);
};

/**
 * EN: Static method to get upcoming meetings
 * FR: Méthode statique pour récupérer les réunions à venir
 * @param {string} userId - The user ID / L'ID utilisateur
 * @param {number} hours - Number of hours to look ahead / Nombre d'heures à regarder en avant
 * @returns {Promise<Meeting[]>} Array of upcoming meetings / Tableau de réunions à venir
 */
MeetingSchema.statics.getUpcomingMeetings = async function(userId, hours = 24) {
  const now = new Date();
  const future = new Date(now.getTime() + hours * 60 * 60 * 1000);

  return this.find({
    $or: [
      { organizerId: userId },
      { 'participants.userId': userId }
    ],
    status: 'scheduled',
    scheduledStart: { $gte: now, $lte: future }
  })
  .populate('organizerId', 'firstName lastName email profilePicture')
  .populate('participants.userId', 'firstName lastName email profilePicture')
  .sort({ scheduledStart: 1 });
};

/**
 * EN: Static method to get meeting statistics
 * FR: Méthode statique pour récupérer les statistiques de réunions
 * @param {string} userId - The user ID / L'ID utilisateur
 * @param {number} days - Number of days to look back / Nombre de jours à regarder en arrière
 * @returns {Promise<object>} Meeting statistics / Statistiques de réunions
 */
MeetingSchema.statics.getMeetingStats = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await this.aggregate([
    {
      $match: {
        $or: [
          { organizerId: mongoose.Types.ObjectId(userId) },
          { 'participants.userId': mongoose.Types.ObjectId(userId) }
        ],
        scheduledStart: { $gte: startDate }
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

  const totalMeetings = await this.countDocuments({
    $or: [
      { organizerId: userId },
      { 'participants.userId': userId }
    ],
    scheduledStart: { $gte: startDate }
  });

  return {
    byStatus: stats,
    totalMeetings,
    period: days
  };
};

const Meeting = mongoose.model('Meeting', MeetingSchema); // EN: Create the Meeting model / FR: Créer le modèle Meeting

export default Meeting;
