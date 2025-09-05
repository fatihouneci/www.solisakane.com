/**
 * @file network.model.js
 * @description
 * EN: This file defines the Mongoose schema and model for Network and Sync operations.
 * It stores information about network status, sync operations, and data saving modes.
 * FR: Ce fichier définit le schéma et le modèle Mongoose pour les opérations Réseau et Sync.
 * Il stocke les informations sur le statut réseau, les opérations de sync et les modes d'économie de données.
 */
import mongoose from "mongoose"; // EN: Mongoose library / FR: Bibliothèque Mongoose

const NetworkSchema = new mongoose.Schema({
  userId: { // EN: Reference to the User / FR: Référence à l'utilisateur
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  deviceId: { // EN: Device identifier / FR: Identifiant de l'appareil
    type: String,
    required: true,
    index: true
  },
  connectionStatus: { // EN: Current connection status / FR: Statut de connexion actuel
    isConnected: {
      type: Boolean,
      default: true
    },
    connectionType: {
      type: String,
      enum: ['wifi', 'cellular', 'ethernet', 'offline'],
      default: 'wifi'
    },
    signalStrength: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    bandwidth: {
      download: Number, // EN: Download speed in Mbps / FR: Vitesse de téléchargement en Mbps
      upload: Number,   // EN: Upload speed in Mbps / FR: Vitesse de téléchargement en Mbps
      latency: Number   // EN: Latency in ms / FR: Latence en ms
    },
    lastConnected: {
      type: Date,
      default: Date.now
    },
    lastDisconnected: Date,
    connectionDuration: Number, // EN: Duration in seconds / FR: Durée en secondes
    reconnectAttempts: {
      type: Number,
      default: 0
    },
    maxReconnectAttempts: {
      type: Number,
      default: 5
    }
  },
  dataSavingMode: { // EN: Data saving configuration / FR: Configuration d'économie de données
    enabled: {
      type: Boolean,
      default: false
    },
    autoEnable: {
      type: Boolean,
      default: true
    },
    cellularThreshold: {
      type: Number,
      default: 50 // EN: Enable when signal < 50% / FR: Activer quand signal < 50%
    },
    settings: {
      compressImages: {
        type: Boolean,
        default: true
      },
      reduceVideoQuality: {
        type: Boolean,
        default: true
      },
      limitAutoDownload: {
        type: Boolean,
        default: true
      },
      disableAnimations: {
        type: Boolean,
        default: false
      },
      reduceSyncFrequency: {
        type: Boolean,
        default: true
      },
      blockLargeFiles: {
        type: Boolean,
        default: true
      },
      maxFileSize: {
        type: Number,
        default: 5 * 1024 * 1024 // EN: 5MB in bytes / FR: 5MB en octets
      }
    },
    dataUsage: {
      today: {
        type: Number,
        default: 0 // EN: Data used today in bytes / FR: Données utilisées aujourd'hui en octets
      },
      thisMonth: {
        type: Number,
        default: 0 // EN: Data used this month in bytes / FR: Données utilisées ce mois en octets
      },
      limit: {
        type: Number,
        default: 1024 * 1024 * 1024 // EN: 1GB limit in bytes / FR: Limite 1GB en octets
      },
      resetDate: {
        type: Date,
        default: function() {
          const now = new Date();
          return new Date(now.getFullYear(), now.getMonth(), 1);
        }
      }
    }
  },
  syncStatus: { // EN: Synchronization status / FR: Statut de synchronisation
    lastSync: {
      type: Date,
      default: Date.now
    },
    syncFrequency: {
      type: Number,
      default: 300 // EN: 5 minutes in seconds / FR: 5 minutes en secondes
    },
    autoSync: {
      type: Boolean,
      default: true
    },
    syncTypes: {
      messages: {
        type: Boolean,
        default: true
      },
      files: {
        type: Boolean,
        default: true
      },
      contacts: {
        type: Boolean,
        default: true
      },
      settings: {
        type: Boolean,
        default: true
      },
      statuses: {
        type: Boolean,
        default: true
      },
      notifications: {
        type: Boolean,
        default: true
      }
    },
    pendingSync: [{
      type: {
        type: String,
        enum: ['message', 'file', 'contact', 'setting', 'status', 'notification'],
        required: true
      },
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      operation: {
        type: String,
        enum: ['create', 'update', 'delete'],
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      retryCount: {
        type: Number,
        default: 0
      },
      maxRetries: {
        type: Number,
        default: 3
      }
    }],
    syncErrors: [{
      type: {
        type: String,
        required: true
      },
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      error: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      resolved: {
        type: Boolean,
        default: false
      }
    }]
  },
  backupSettings: { // EN: Backup configuration / FR: Configuration de sauvegarde
    enabled: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    },
    lastBackup: Date,
    nextBackup: {
      type: Date,
      default: function() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(2, 0, 0, 0); // EN: 2 AM / FR: 2h du matin
        return tomorrow;
      }
    },
    backupTypes: {
      messages: {
        type: Boolean,
        default: true
      },
      files: {
        type: Boolean,
        default: true
      },
      contacts: {
        type: Boolean,
        default: true
      },
      settings: {
        type: Boolean,
        default: true
      },
      statuses: {
        type: Boolean,
        default: true
      }
    },
    storageLocation: {
      type: String,
      enum: ['local', 'cloud', 'both'],
      default: 'cloud'
    },
    encryption: {
      enabled: {
        type: Boolean,
        default: true
      },
      algorithm: {
        type: String,
        default: 'AES-256-GCM'
      }
    },
    retention: {
      type: Number,
      default: 90 // EN: Days to keep backups / FR: Jours de conservation des sauvegardes
    }
  },
  emojiSettings: { // EN: Emoji configuration / FR: Configuration des emojis
    enabled: {
      type: Boolean,
      default: true
    },
    skinTone: {
      type: String,
      enum: ['default', 'light', 'medium-light', 'medium', 'medium-dark', 'dark'],
      default: 'default'
    },
    categories: {
      people: {
        type: Boolean,
        default: true
      },
      nature: {
        type: Boolean,
        default: true
      },
      food: {
        type: Boolean,
        default: true
      },
      activity: {
        type: Boolean,
        default: true
      },
      travel: {
        type: Boolean,
        default: true
      },
      objects: {
        type: Boolean,
        default: true
      },
      symbols: {
        type: Boolean,
        default: true
      },
      flags: {
        type: Boolean,
        default: true
      }
    },
    recentEmojis: [{
      emoji: {
        type: String,
        required: true
      },
      usageCount: {
        type: Number,
        default: 1
      },
      lastUsed: {
        type: Date,
        default: Date.now
      }
    }],
    favorites: [{
      emoji: {
        type: String,
        required: true
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  metadata: { // EN: Additional metadata / FR: Métadonnées supplémentaires
    deviceInfo: {
      platform: String,
      version: String,
      model: String,
      manufacturer: String,
      userAgent: String
    },
    location: {
      country: String,
      city: String,
      timezone: String
    },
    appVersion: String,
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }
}, { 
  timestamps: true // EN: Adds createdAt and updatedAt timestamps / FR: Ajoute les horodatages createdAt et updatedAt
});

// EN: Indexes for better performance / FR: Index pour de meilleures performances
NetworkSchema.index({ userId: 1, deviceId: 1 });
NetworkSchema.index({ 'connectionStatus.isConnected': 1 });
NetworkSchema.index({ 'syncStatus.lastSync': 1 });
NetworkSchema.index({ 'backupSettings.nextBackup': 1 });

// EN: Pre-save hook to update connection duration / FR: Hook de pré-sauvegarde pour mettre à jour la durée de connexion
NetworkSchema.pre('save', function(next) {
  if (this.connectionStatus.isConnected && this.connectionStatus.lastConnected) {
    const now = new Date();
    this.connectionStatus.connectionDuration = Math.floor(
      (now.getTime() - this.connectionStatus.lastConnected.getTime()) / 1000
    );
  }
  next();
});

/**
 * EN: Instance method to update connection status
 * FR: Méthode d'instance pour mettre à jour le statut de connexion
 * @param {boolean} isConnected - Connection status / Statut de connexion
 * @param {string} connectionType - Type of connection / Type de connexion
 * @param {number} signalStrength - Signal strength / Force du signal
 * @returns {Promise<Network>} The updated network record / L'enregistrement réseau mis à jour
 */
NetworkSchema.methods.updateConnectionStatus = async function(isConnected, connectionType, signalStrength) {
  const now = new Date();
  
  if (isConnected && !this.connectionStatus.isConnected) {
    // EN: Reconnected / FR: Reconnecté
    this.connectionStatus.isConnected = true;
    this.connectionStatus.connectionType = connectionType;
    this.connectionStatus.signalStrength = signalStrength;
    this.connectionStatus.lastConnected = now;
    this.connectionStatus.reconnectAttempts = 0;
  } else if (!isConnected && this.connectionStatus.isConnected) {
    // EN: Disconnected / FR: Déconnecté
    this.connectionStatus.isConnected = false;
    this.connectionStatus.lastDisconnected = now;
    this.connectionStatus.reconnectAttempts += 1;
  } else if (isConnected) {
    // EN: Update existing connection / FR: Mettre à jour la connexion existante
    this.connectionStatus.connectionType = connectionType;
    this.connectionStatus.signalStrength = signalStrength;
  }
  
  return await this.save();
};

/**
 * EN: Instance method to add pending sync item
 * FR: Méthode d'instance pour ajouter un élément de sync en attente
 * @param {string} type - Item type / Type d'élément
 * @param {string} itemId - Item ID / ID de l'élément
 * @param {string} operation - Operation type / Type d'opération
 * @returns {Promise<Network>} The updated network record / L'enregistrement réseau mis à jour
 */
NetworkSchema.methods.addPendingSync = async function(type, itemId, operation) {
  // EN: Check if item already exists in pending sync / FR: Vérifier si l'élément existe déjà dans le sync en attente
  const existingItem = this.syncStatus.pendingSync.find(item => 
    item.type === type && item.itemId.toString() === itemId.toString()
  );
  
  if (existingItem) {
    // EN: Update existing item / FR: Mettre à jour l'élément existant
    existingItem.operation = operation;
    existingItem.timestamp = new Date();
    existingItem.retryCount = 0;
  } else {
    // EN: Add new item / FR: Ajouter un nouvel élément
    this.syncStatus.pendingSync.push({
      type,
      itemId,
      operation,
      timestamp: new Date()
    });
  }
  
  return await this.save();
};

/**
 * EN: Instance method to record sync error
 * FR: Méthode d'instance pour enregistrer une erreur de sync
 * @param {string} type - Item type / Type d'élément
 * @param {string} itemId - Item ID / ID de l'élément
 * @param {string} error - Error message / Message d'erreur
 * @returns {Promise<Network>} The updated network record / L'enregistrement réseau mis à jour
 */
NetworkSchema.methods.recordSyncError = async function(type, itemId, error) {
  this.syncStatus.syncErrors.push({
    type,
    itemId,
    error,
    timestamp: new Date()
  });
  
  return await this.save();
};

/**
 * EN: Instance method to update data usage
 * FR: Méthode d'instance pour mettre à jour l'utilisation des données
 * @param {number} bytes - Data used in bytes / Données utilisées en octets
 * @returns {Promise<Network>} The updated network record / L'enregistrement réseau mis à jour
 */
NetworkSchema.methods.updateDataUsage = async function(bytes) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // EN: Reset daily usage if new day / FR: Réinitialiser l'usage quotidien si nouveau jour
  if (this.dataSavingMode.dataUsage.resetDate < today) {
    this.dataSavingMode.dataUsage.today = 0;
    this.dataSavingMode.dataUsage.resetDate = today;
  }
  
  // EN: Reset monthly usage if new month / FR: Réinitialiser l'usage mensuel si nouveau mois
  if (this.dataSavingMode.dataUsage.resetDate < monthStart) {
    this.dataSavingMode.dataUsage.thisMonth = 0;
    this.dataSavingMode.dataUsage.resetDate = monthStart;
  }
  
  this.dataSavingMode.dataUsage.today += bytes;
  this.dataSavingMode.dataUsage.thisMonth += bytes;
  
  return await this.save();
};

/**
 * EN: Instance method to add recent emoji
 * FR: Méthode d'instance pour ajouter un emoji récent
 * @param {string} emoji - Emoji character / Caractère emoji
 * @returns {Promise<Network>} The updated network record / L'enregistrement réseau mis à jour
 */
NetworkSchema.methods.addRecentEmoji = async function(emoji) {
  const existingEmoji = this.emojiSettings.recentEmojis.find(item => item.emoji === emoji);
  
  if (existingEmoji) {
    existingEmoji.usageCount += 1;
    existingEmoji.lastUsed = new Date();
  } else {
    this.emojiSettings.recentEmojis.push({
      emoji,
      usageCount: 1,
      lastUsed: new Date()
    });
  }
  
  // EN: Keep only last 50 recent emojis / FR: Garder seulement les 50 derniers emojis récents
  this.emojiSettings.recentEmojis = this.emojiSettings.recentEmojis
    .sort((a, b) => b.lastUsed - a.lastUsed)
    .slice(0, 50);
  
  return await this.save();
};

/**
 * EN: Static method to get network status for user
 * FR: Méthode statique pour récupérer le statut réseau de l'utilisateur
 * @param {string} userId - The user ID / L'ID utilisateur
 * @param {string} deviceId - The device ID / L'ID de l'appareil
 * @returns {Promise<Network>} Network record / Enregistrement réseau
 */
NetworkSchema.statics.getNetworkStatus = async function(userId, deviceId) {
  let network = await this.findOne({ userId, deviceId });
  
  if (!network) {
    network = new this({
      userId,
      deviceId,
      connectionStatus: {
        isConnected: true,
        connectionType: 'wifi',
        signalStrength: 100,
        lastConnected: new Date()
      }
    });
    await network.save();
  }
  
  return network;
};

/**
 * EN: Static method to get devices needing sync
 * FR: Méthode statique pour récupérer les appareils nécessitant une sync
 * @param {number} minutes - Minutes since last sync / Minutes depuis la dernière sync
 * @returns {Promise<Network[]>} Array of network records / Tableau d'enregistrements réseau
 */
NetworkSchema.statics.getDevicesNeedingSync = async function(minutes = 5) {
  const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
  
  return this.find({
    'syncStatus.autoSync': true,
    'syncStatus.lastSync': { $lt: cutoffTime },
    'connectionStatus.isConnected': true
  });
};

/**
 * EN: Static method to get devices needing backup
 * FR: Méthode statique pour récupérer les appareils nécessitant une sauvegarde
 * @returns {Promise<Network[]>} Array of network records / Tableau d'enregistrements réseau
 */
NetworkSchema.statics.getDevicesNeedingBackup = async function() {
  const now = new Date();
  
  return this.find({
    'backupSettings.enabled': true,
    'backupSettings.nextBackup': { $lte: now },
    'connectionStatus.isConnected': true
  });
};

const Network = mongoose.model('Network', NetworkSchema); // EN: Create the Network model / FR: Créer le modèle Network

export default Network;
