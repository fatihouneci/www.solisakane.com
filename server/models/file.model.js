
/**
 * @file file.model.js
 * @description
 * EN: This file defines the Mongoose schema and model for a File.
 * It stores metadata about uploaded files, including their name, type, and associated user.
 * FR: Ce fichier définit le schéma et le modèle Mongoose pour un Fichier.
 * Il stocke les métadonnées des fichiers téléversés, y compris leur nom, leur type et l'utilisateur associé.
 */
import mongoose from 'mongoose'; // EN: Mongoose library / FR: Bibliothèque Mongoose
const Schema = mongoose.Schema; // EN: Alias for mongoose.Schema / FR: Alias pour mongoose.Schema

const FileSchema = new Schema({
  name: { // EN: Original name of the file / FR: Nom original du fichier
    type: String,
    required: true
  },
  filename: { // EN: Generated filename on server / FR: Nom de fichier généré sur le serveur
    type: String,
    required: true
  },
  originalName: { // EN: Original filename from client / FR: Nom de fichier original du client
    type: String,
    required: true
  },
  type: { // EN: MIME type of the file / FR: Type MIME du fichier
    type: String,
    required: true
  },
  category: { // EN: Category of the file (e.g., 'image', 'audio', 'video', 'document') / FR: Catégorie du fichier (ex: 'image', 'audio', 'vidéo', 'document')
    type: String,
    enum: ['image', 'audio', 'video', 'document', 'other'],
    required: true
  },
  size: { // EN: File size in bytes / FR: Taille du fichier en octets
    type: Number,
    required: true
  },
  path: { // EN: File path on server / FR: Chemin du fichier sur le serveur
    type: String,
    required: true
  },
  url: { // EN: Public URL to access the file / FR: URL publique pour accéder au fichier
    type: String,
    required: true
  },
  thumbnail: { // EN: Thumbnail URL for images/videos / FR: URL de miniature pour images/vidéos
    type: String
  },
  metadata: { // EN: Additional file metadata / FR: Métadonnées supplémentaires du fichier
    width: Number, // EN: Image/video width / FR: Largeur image/vidéo
    height: Number, // EN: Image/video height / FR: Hauteur image/vidéo
    duration: Number, // EN: Audio/video duration in seconds / FR: Durée audio/vidéo en secondes
    format: String, // EN: File format / FR: Format du fichier
    quality: String, // EN: Quality indicator / FR: Indicateur de qualité
    tags: [String], // EN: File tags for search / FR: Tags du fichier pour la recherche
    description: String, // EN: File description / FR: Description du fichier
    location: { // EN: GPS location if available / FR: Localisation GPS si disponible
      latitude: Number,
      longitude: Number,
      address: String
    }
  },
  user: { // EN: Reference to the User who uploaded the file / FR: Référence à l'utilisateur qui a téléversé le fichier
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chat: { // EN: Reference to the Chat if file is shared in a chat / FR: Référence au Chat si le fichier est partagé dans un chat
    type: Schema.Types.ObjectId,
    ref: 'Chat'
  },
  message: { // EN: Reference to the Message if file is attached to a message / FR: Référence au Message si le fichier est attaché à un message
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  isPublic: { // EN: Whether the file is publicly accessible / FR: Si le fichier est accessible publiquement
    type: Boolean,
    default: false
  },
  downloadCount: { // EN: Number of times the file has been downloaded / FR: Nombre de fois que le fichier a été téléchargé
    type: Number,
    default: 0
  },
  lastAccessed: { // EN: Last time the file was accessed / FR: Dernière fois que le fichier a été accédé
    type: Date,
    default: Date.now
  },
  isDeleted: { // EN: Soft delete flag / FR: Indicateur de suppression logique
    type: Boolean,
    default: false
  }
}, { timestamps: true }); // EN: Adds createdAt and updatedAt timestamps / FR: Ajoute les horodatages createdAt et updatedAt

// EN: Pre-save hook to set file category based on MIME type / FR: Hook de pré-sauvegarde pour définir la catégorie de fichier basée sur le type MIME
FileSchema.pre('save', function(next) {
  if (this.isModified('type')) {
    const mimeType = this.type.toLowerCase();
    if (mimeType.startsWith('image/')) {
      this.category = 'image';
    } else if (mimeType.startsWith('audio/')) {
      this.category = 'audio';
    } else if (mimeType.startsWith('video/')) {
      this.category = 'video';
    } else if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
      this.category = 'document';
    } else {
      this.category = 'other';
    }
  }
  next();
});

/**
 * EN: Instance method to get file size in human readable format
 * FR: Méthode d'instance pour obtenir la taille du fichier dans un format lisible
 * @returns {string} Human readable file size / Taille de fichier lisible
 */
FileSchema.methods.getHumanReadableSize = function() {
  const bytes = this.size;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * EN: Instance method to check if file is an image
 * FR: Méthode d'instance pour vérifier si le fichier est une image
 * @returns {boolean} True if file is an image / Vrai si le fichier est une image
 */
FileSchema.methods.isImage = function() {
  return this.category === 'image';
};

/**
 * EN: Instance method to check if file is a video
 * FR: Méthode d'instance pour vérifier si le fichier est une vidéo
 * @returns {boolean} True if file is a video / Vrai si le fichier est une vidéo
 */
FileSchema.methods.isVideo = function() {
  return this.category === 'video';
};

/**
 * EN: Instance method to check if file is audio
 * FR: Méthode d'instance pour vérifier si le fichier est audio
 * @returns {boolean} True if file is audio / Vrai si le fichier est audio
 */
FileSchema.methods.isAudio = function() {
  return this.category === 'audio';
};

/**
 * EN: Static method to find files by user
 * FR: Méthode statique pour trouver les fichiers par utilisateur
 * @param {string} userId - User ID / ID utilisateur
 * @param {object} options - Query options / Options de requête
 * @returns {Promise<File[]>} Array of files / Tableau de fichiers
 */
FileSchema.statics.findByUser = async function(userId, options = {}) {
  const { category, limit = 20, skip = 0, sort = { createdAt: -1 } } = options;
  
  const query = { user: userId, isDeleted: false };
  if (category) {
    query.category = category;
  }
  
  return this.find(query)
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('user', 'firstName lastName profilePicture');
};

/**
 * EN: Static method to search files
 * FR: Méthode statique pour rechercher des fichiers
 * @param {string} searchTerm - Search term / Terme de recherche
 * @param {object} options - Search options / Options de recherche
 * @returns {Promise<File[]>} Array of matching files / Tableau de fichiers correspondants
 */
FileSchema.statics.searchFiles = async function(searchTerm, options = {}) {
  const { userId, category, limit = 20, skip = 0 } = options;
  
  const query = {
    isDeleted: false,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { originalName: { $regex: searchTerm, $options: 'i' } },
      { 'metadata.description': { $regex: searchTerm, $options: 'i' } },
      { 'metadata.tags': { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  };
  
  if (userId) {
    query.user = userId;
  }
  
  if (category) {
    query.category = category;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('user', 'firstName lastName profilePicture');
};

/**
 * EN: Static method to get file statistics for a user
 * FR: Méthode statique pour obtenir les statistiques de fichiers pour un utilisateur
 * @param {string} userId - User ID / ID utilisateur
 * @returns {Promise<object>} File statistics / Statistiques de fichiers
 */
FileSchema.statics.getUserFileStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId), isDeleted: false } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalSize: { $sum: '$size' }
      }
    }
  ]);
  
  const totalFiles = await this.countDocuments({ user: userId, isDeleted: false });
  const totalSize = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId), isDeleted: false } },
    { $group: { _id: null, totalSize: { $sum: '$size' } } }
  ]);
  
  return {
    totalFiles,
    totalSize: totalSize[0]?.totalSize || 0,
    byCategory: stats
  };
};

const File = mongoose.model('File', FileSchema); // EN: Create the File model / FR: Créer le modèle File
export default File;
