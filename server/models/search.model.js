/**
 * @file search.model.js
 * @description
 * EN: This file defines the Mongoose schema and model for Search functionality.
 * It stores search history, saved searches, and search analytics.
 * FR: Ce fichier définit le schéma et le modèle Mongoose pour la fonctionnalité de Recherche.
 * Il stocke l'historique de recherche, les recherches sauvegardées et les analytics de recherche.
 */
import mongoose from "mongoose"; // EN: Mongoose library / FR: Bibliothèque Mongoose

const SearchSchema = new mongoose.Schema({
  userId: { // EN: Reference to the User who performed the search / FR: Référence à l'utilisateur qui a effectué la recherche
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  query: { // EN: Search query / FR: Requête de recherche
    type: String,
    required: true,
    maxlength: 500
  },
  type: { // EN: Type of search / FR: Type de recherche
    type: String,
    enum: ['global', 'messages', 'files', 'contacts', 'statuses', 'meetings', 'chats'],
    required: true,
    index: true
  },
  filters: { // EN: Search filters applied / FR: Filtres de recherche appliqués
    dateRange: {
      start: Date,
      end: Date
    },
    fileTypes: [String],
    chatTypes: [String],
    statusTypes: [String],
    meetingTypes: [String],
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    tags: [String],
    categories: [String]
  },
  results: { // EN: Search results metadata / FR: Métadonnées des résultats de recherche
    totalCount: {
      type: Number,
      default: 0
    },
    returnedCount: {
      type: Number,
      default: 0
    },
    resultTypes: [{
      type: String,
      count: Number
    }],
    executionTime: Number, // EN: Search execution time in milliseconds / FR: Temps d'exécution de la recherche en millisecondes
    hasMore: {
      type: Boolean,
      default: false
    }
  },
  isSaved: { // EN: Whether this search is saved / FR: Si cette recherche est sauvegardée
    type: Boolean,
    default: false
  },
  savedAt: { // EN: When the search was saved / FR: Quand la recherche a été sauvegardée
    type: Date
  },
  lastUsed: { // EN: When the search was last used / FR: Quand la recherche a été utilisée pour la dernière fois
    type: Date,
    default: Date.now
  },
  usageCount: { // EN: Number of times this search was used / FR: Nombre de fois que cette recherche a été utilisée
    type: Number,
    default: 1
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
    source: {
      type: String,
      enum: ['app', 'web', 'api'],
      default: 'app'
    },
    sessionId: String, // EN: Session ID for grouping related searches / FR: ID de session pour grouper les recherches liées
    referrer: String // EN: Where the search was initiated from / FR: D'où la recherche a été initiée
  }
}, { 
  timestamps: true // EN: Adds createdAt and updatedAt timestamps / FR: Ajoute les horodatages createdAt et updatedAt
});

// EN: Indexes for better performance / FR: Index pour de meilleures performances
SearchSchema.index({ userId: 1, createdAt: -1 });
SearchSchema.index({ userId: 1, type: 1, createdAt: -1 });
SearchSchema.index({ userId: 1, isSaved: 1, lastUsed: -1 });
SearchSchema.index({ query: 'text' }); // EN: Text search index / FR: Index de recherche textuelle
SearchSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // EN: Auto-delete after 90 days / FR: Suppression automatique après 90 jours

// EN: Pre-save hook to update usage statistics / FR: Hook de pré-sauvegarde pour mettre à jour les statistiques d'usage
SearchSchema.pre('save', function(next) {
  if (this.isModified('isSaved') && this.isSaved && !this.savedAt) {
    this.savedAt = new Date();
  }
  this.lastUsed = new Date();
  next();
});

/**
 * EN: Instance method to increment usage count
 * FR: Méthode d'instance pour incrémenter le compteur d'usage
 * @returns {Promise<Search>} The updated search / La recherche mise à jour
 */
SearchSchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return await this.save();
};

/**
 * EN: Instance method to save the search
 * FR: Méthode d'instance pour sauvegarder la recherche
 * @returns {Promise<Search>} The updated search / La recherche mise à jour
 */
SearchSchema.methods.saveSearch = async function() {
  this.isSaved = true;
  this.savedAt = new Date();
  return await this.save();
};

/**
 * EN: Instance method to unsave the search
 * FR: Méthode d'instance pour ne plus sauvegarder la recherche
 * @returns {Promise<Search>} The updated search / La recherche mise à jour
 */
SearchSchema.methods.unsaveSearch = async function() {
  this.isSaved = false;
  this.savedAt = null;
  return await this.save();
};

/**
 * EN: Static method to get user search history
 * FR: Méthode statique pour récupérer l'historique de recherche de l'utilisateur
 * @param {string} userId - The user ID / L'ID utilisateur
 * @param {object} options - Query options / Options de requête
 * @returns {Promise<Search[]>} Array of searches / Tableau de recherches
 */
SearchSchema.statics.getUserSearchHistory = async function(userId, options = {}) {
  const {
    type = null,
    limit = 20,
    skip = 0,
    savedOnly = false
  } = options;

  const query = { userId };

  if (type) {
    query.type = type;
  }

  if (savedOnly) {
    query.isSaved = true;
  }

  return this.find(query)
    .sort({ lastUsed: -1 })
    .limit(limit)
    .skip(skip);
};

/**
 * EN: Static method to get popular searches
 * FR: Méthode statique pour récupérer les recherches populaires
 * @param {string} userId - The user ID / L'ID utilisateur
 * @param {object} options - Query options / Options de requête
 * @returns {Promise<Search[]>} Array of popular searches / Tableau de recherches populaires
 */
SearchSchema.statics.getPopularSearches = async function(userId, options = {}) {
  const {
    type = null,
    limit = 10,
    days = 30
  } = options;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const query = {
    userId,
    createdAt: { $gte: startDate }
  };

  if (type) {
    query.type = type;
  }

  return this.find(query)
    .sort({ usageCount: -1, lastUsed: -1 })
    .limit(limit);
};

/**
 * EN: Static method to get search suggestions
 * FR: Méthode statique pour récupérer les suggestions de recherche
 * @param {string} userId - The user ID / L'ID utilisateur
 * @param {string} partialQuery - Partial search query / Requête de recherche partielle
 * @param {string} type - Search type / Type de recherche
 * @param {number} limit - Number of suggestions / Nombre de suggestions
 * @returns {Promise<Search[]>} Array of search suggestions / Tableau de suggestions de recherche
 */
SearchSchema.statics.getSearchSuggestions = async function(userId, partialQuery, type = null, limit = 5) {
  const query = {
    userId,
    query: { $regex: partialQuery, $options: 'i' }
  };

  if (type) {
    query.type = type;
  }

  return this.find(query)
    .sort({ usageCount: -1, lastUsed: -1 })
    .limit(limit);
};

/**
 * EN: Static method to get search analytics
 * FR: Méthode statique pour récupérer les analytics de recherche
 * @param {string} userId - The user ID / L'ID utilisateur
 * @param {number} days - Number of days to look back / Nombre de jours à regarder en arrière
 * @returns {Promise<object>} Search analytics / Analytics de recherche
 */
SearchSchema.statics.getSearchAnalytics = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const analytics = await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalUsage: { $sum: '$usageCount' },
        avgExecutionTime: { $avg: '$results.executionTime' }
      }
    }
  ]);

  const totalSearches = await this.countDocuments({
    userId,
    createdAt: { $gte: startDate }
  });

  const savedSearches = await this.countDocuments({
    userId,
    isSaved: true
  });

  return {
    byType: analytics,
    totalSearches,
    savedSearches,
    period: days
  };
};

/**
 * EN: Static method to clear search history
 * FR: Méthode statique pour effacer l'historique de recherche
 * @param {string} userId - The user ID / L'ID utilisateur
 * @param {string} type - Optional search type / Type de recherche optionnel
 * @returns {Promise<object>} Deletion result / Résultat de suppression
 */
SearchSchema.statics.clearSearchHistory = async function(userId, type = null) {
  const query = { userId };
  if (type) {
    query.type = type;
  }

  return this.deleteMany(query);
};

/**
 * EN: Static method to create a search record
 * FR: Méthode statique pour créer un enregistrement de recherche
 * @param {object} searchData - Search data / Données de recherche
 * @returns {Promise<Search>} The created search / La recherche créée
 */
SearchSchema.statics.createSearch = async function(searchData) {
  // EN: Check if similar search exists / FR: Vérifier si une recherche similaire existe
  const existingSearch = await this.findOne({
    userId: searchData.userId,
    query: searchData.query,
    type: searchData.type
  });

  if (existingSearch) {
    // EN: Update existing search / FR: Mettre à jour la recherche existante
    existingSearch.usageCount += 1;
    existingSearch.lastUsed = new Date();
    existingSearch.results = searchData.results;
    return await existingSearch.save();
  } else {
    // EN: Create new search / FR: Créer une nouvelle recherche
    const search = new this(searchData);
    return await search.save();
  }
};

const Search = mongoose.model('Search', SearchSchema); // EN: Create the Search model / FR: Créer le modèle Search

export default Search;
