/**
 * @file status.model.js
 * @description
 * EN: This file defines the Mongoose schema and model for User Status/Stories.
 * It stores information about user status updates, stories, and temporary content.
 * FR: Ce fichier définit le schéma et le modèle Mongoose pour les Statuts/Stories d'utilisateur.
 * Il stocke les informations sur les mises à jour de statut, stories et contenu temporaire.
 */
import mongoose from "mongoose"; // EN: Mongoose library / FR: Bibliothèque Mongoose

const StatusSchema = new mongoose.Schema({
  userId: { // EN: Reference to the User who created the status / FR: Référence à l'utilisateur qui a créé le statut
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: { // EN: Type of status (text, image, video, audio, location) / FR: Type de statut (texte, image, vidéo, audio, localisation)
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'location', 'poll'],
    required: true
  },
  content: { // EN: Status content / FR: Contenu du statut
    text: {
      type: String,
      maxlength: 500
    },
    media: {
      url: String,
      thumbnail: String,
      duration: Number, // EN: For video/audio in seconds / FR: Pour vidéo/audio en secondes
      size: Number, // EN: File size in bytes / FR: Taille du fichier en octets
      format: String // EN: File format (jpg, png, mp4, mp3, etc.) / FR: Format du fichier
    },
    location: {
      name: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      address: String
    },
    poll: {
      question: String,
      options: [{
        text: String,
        votes: [{
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
          },
          votedAt: {
            type: Date,
            default: Date.now
          }
        }],
        count: {
          type: Number,
          default: 0
        }
      }],
      allowMultiple: {
        type: Boolean,
        default: false
      },
      expiresAt: Date
    }
  },
  visibility: { // EN: Who can see this status / FR: Qui peut voir ce statut
    type: String,
    enum: ['public', 'contacts', 'custom'],
    default: 'contacts'
  },
  allowedUsers: [{ // EN: Custom visibility - specific users / FR: Visibilité personnalisée - utilisateurs spécifiques
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  blockedUsers: [{ // EN: Users who cannot see this status / FR: Utilisateurs qui ne peuvent pas voir ce statut
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reactions: [{ // EN: User reactions to the status / FR: Réactions des utilisateurs au statut
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry'],
      default: 'like'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{ // EN: Comments on the status / FR: Commentaires sur le statut
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true,
      maxlength: 200
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  views: [{ // EN: Users who viewed this status / FR: Utilisateurs qui ont vu ce statut
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: [{ // EN: Users who shared this status / FR: Utilisateurs qui ont partagé ce statut
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  expiresAt: { // EN: When this status expires (for stories) / FR: Quand ce statut expire (pour les stories)
    type: Date,
    default: function() {
      // EN: Default 24 hours for stories / FR: 24 heures par défaut pour les stories
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  },
  isActive: { // EN: Whether the status is currently active / FR: Si le statut est actuellement actif
    type: Boolean,
    default: true
  },
  isPinned: { // EN: Whether the status is pinned to profile / FR: Si le statut est épinglé au profil
    type: Boolean,
    default: false
  },
  metadata: { // EN: Additional metadata / FR: Métadonnées supplémentaires
    deviceInfo: {
      platform: String,
      version: String,
      userAgent: String
    },
    location: {
      country: String,
      city: String,
      timezone: String
    },
    tags: [String], // EN: Hashtags or mentions / FR: Hashtags ou mentions
    mentions: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      username: String
    }]
  }
}, { 
  timestamps: true, // EN: Adds createdAt and updatedAt timestamps / FR: Ajoute les horodatages createdAt et updatedAt
  expires: 'expiresAt' // EN: TTL index for automatic deletion / FR: Index TTL pour suppression automatique
});

// EN: Indexes for better performance / FR: Index pour de meilleures performances
StatusSchema.index({ userId: 1, createdAt: -1 });
StatusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
StatusSchema.index({ 'content.text': 'text' }); // EN: Text search index / FR: Index de recherche textuelle
StatusSchema.index({ visibility: 1, isActive: 1 });

// EN: Pre-save hook to update poll vote counts / FR: Hook de pré-sauvegarde pour mettre à jour les compteurs de votes
StatusSchema.pre('save', function(next) {
  if (this.type === 'poll' && this.content.poll) {
    this.content.poll.options.forEach(option => {
      option.count = option.votes.length;
    });
  }
  next();
});

/**
 * EN: Instance method to check if user can view this status
 * FR: Méthode d'instance pour vérifier si l'utilisateur peut voir ce statut
 * @param {string} userId - The user ID to check / L'ID utilisateur à vérifier
 * @returns {boolean} Whether the user can view the status / Si l'utilisateur peut voir le statut
 */
StatusSchema.methods.canView = function(userId) {
  // EN: Check if user is blocked / FR: Vérifier si l'utilisateur est bloqué
  if (this.blockedUsers.includes(userId)) {
    return false;
  }

  // EN: Check visibility settings / FR: Vérifier les paramètres de visibilité
  switch (this.visibility) {
    case 'public':
      return true;
    case 'contacts':
      // EN: In a real app, you would check if users are contacts / FR: Dans une vraie app, vous vérifieriez si les utilisateurs sont contacts
      return true;
    case 'custom':
      return this.allowedUsers.includes(userId);
    default:
      return false;
  }
};

/**
 * EN: Instance method to add a reaction
 * FR: Méthode d'instance pour ajouter une réaction
 * @param {string} userId - The user ID / L'ID utilisateur
 * @param {string} reactionType - The type of reaction / Le type de réaction
 * @returns {Promise<Status>} The updated status / Le statut mis à jour
 */
StatusSchema.methods.addReaction = async function(userId, reactionType) {
  // EN: Remove existing reaction from this user / FR: Supprimer la réaction existante de cet utilisateur
  this.reactions = this.reactions.filter(reaction => reaction.userId.toString() !== userId);
  
  // EN: Add new reaction / FR: Ajouter une nouvelle réaction
  this.reactions.push({
    userId,
    type: reactionType,
    createdAt: new Date()
  });
  
  return await this.save();
};

/**
 * EN: Instance method to add a comment
 * FR: Méthode d'instance pour ajouter un commentaire
 * @param {string} userId - The user ID / L'ID utilisateur
 * @param {string} text - The comment text / Le texte du commentaire
 * @returns {Promise<Status>} The updated status / Le statut mis à jour
 */
StatusSchema.methods.addComment = async function(userId, text) {
  this.comments.push({
    userId,
    text,
    createdAt: new Date()
  });
  
  return await this.save();
};

/**
 * EN: Instance method to record a view
 * FR: Méthode d'instance pour enregistrer une vue
 * @param {string} userId - The user ID / L'ID utilisateur
 * @returns {Promise<Status>} The updated status / Le statut mis à jour
 */
StatusSchema.methods.recordView = async function(userId) {
  // EN: Check if user already viewed / FR: Vérifier si l'utilisateur a déjà vu
  const existingView = this.views.find(view => view.userId.toString() === userId);
  if (!existingView) {
    this.views.push({
      userId,
      viewedAt: new Date()
    });
    return await this.save();
  }
  return this;
};

/**
 * EN: Static method to get active statuses for a user's feed
 * FR: Méthode statique pour récupérer les statuts actifs pour le feed d'un utilisateur
 * @param {string} userId - The user ID / L'ID utilisateur
 * @param {number} limit - Number of statuses to return / Nombre de statuts à retourner
 * @param {number} skip - Number of statuses to skip / Nombre de statuts à ignorer
 * @returns {Promise<Status[]>} Array of statuses / Tableau de statuts
 */
StatusSchema.statics.getFeed = async function(userId, limit = 20, skip = 0) {
  return this.find({
    isActive: true,
    expiresAt: { $gt: new Date() },
    $or: [
      { visibility: 'public' },
      { visibility: 'contacts' }, // EN: In real app, check contacts / FR: Dans une vraie app, vérifier les contacts
      { allowedUsers: userId }
    ],
    blockedUsers: { $ne: userId }
  })
  .populate('userId', 'firstName lastName profilePicture')
  .populate('reactions.userId', 'firstName lastName')
  .populate('comments.userId', 'firstName lastName')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);
};

/**
 * EN: Static method to get user's own statuses
 * FR: Méthode statique pour récupérer les statuts de l'utilisateur
 * @param {string} userId - The user ID / L'ID utilisateur
 * @param {number} limit - Number of statuses to return / Nombre de statuts à retourner
 * @param {number} skip - Number of statuses to skip / Nombre de statuts à ignorer
 * @returns {Promise<Status[]>} Array of statuses / Tableau de statuts
 */
StatusSchema.statics.getUserStatuses = async function(userId, limit = 20, skip = 0) {
  return this.find({
    userId,
    isActive: true
  })
  .populate('reactions.userId', 'firstName lastName')
  .populate('comments.userId', 'firstName lastName')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);
};

/**
 * EN: Static method to search statuses
 * FR: Méthode statique pour rechercher des statuts
 * @param {string} query - Search query / Requête de recherche
 * @param {string} userId - The user ID / L'ID utilisateur
 * @param {number} limit - Number of results / Nombre de résultats
 * @returns {Promise<Status[]>} Array of matching statuses / Tableau de statuts correspondants
 */
StatusSchema.statics.searchStatuses = async function(query, userId, limit = 20) {
  return this.find({
    $text: { $search: query },
    isActive: true,
    expiresAt: { $gt: new Date() },
    $or: [
      { visibility: 'public' },
      { visibility: 'contacts' },
      { allowedUsers: userId }
    ],
    blockedUsers: { $ne: userId }
  })
  .populate('userId', 'firstName lastName profilePicture')
  .sort({ score: { $meta: 'textScore' } })
  .limit(limit);
};

const Status = mongoose.model('Status', StatusSchema); // EN: Create the Status model / FR: Créer le modèle Status

export default Status;
