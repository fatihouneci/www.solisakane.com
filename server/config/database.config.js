/**
 * @file database.config.js
 * @description
 * EN: This file contains database configuration settings and connection options for MongoDB.
 * FR: Ce fichier contient les paramètres de configuration de base de données et les options de connexion pour MongoDB.
 */
import mongoose from 'mongoose';
import config from './config.js';

/**
 * EN: Database configuration object
 * FR: Objet de configuration de base de données
 */
const databaseConfig = {
  // EN: Connection options / FR: Options de connexion
  connection: {
    uri: config.mongoUri,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10, // EN: Maintain up to 10 socket connections / FR: Maintenir jusqu'à 10 connexions socket
      minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 1, // EN: Maintain a minimum of 1 socket connection / FR: Maintenir un minimum de 1 connexion socket
      maxIdleTimeMS: parseInt(process.env.DB_MAX_IDLE_TIME) || 30000, // EN: Close connections after 30 seconds of inactivity / FR: Fermer les connexions après 30 secondes d'inactivité
      serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT) || 5000, // EN: How long to try selecting a server / FR: Combien de temps essayer de sélectionner un serveur
      socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000, // EN: How long a send or receive on a socket can take / FR: Combien de temps un envoi ou réception sur un socket peut prendre
      connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT) || 30000, // EN: How long to wait for initial connection / FR: Combien de temps attendre pour la connexion initiale
      bufferMaxEntries: 0, // EN: Disable mongoose buffering / FR: Désactiver la mise en mémoire tampon de mongoose
      bufferCommands: false, // EN: Disable mongoose buffering / FR: Désactiver la mise en mémoire tampon de mongoose
      retryWrites: true, // EN: Enable retryable writes / FR: Activer les écritures reproductibles
      retryReads: true, // EN: Enable retryable reads / FR: Activer les lectures reproductibles
      readPreference: process.env.DB_READ_PREFERENCE || 'primary', // EN: Read preference / FR: Préférence de lecture
      writeConcern: {
        w: process.env.DB_WRITE_CONCERN || 'majority', // EN: Write concern / FR: Préoccupation d'écriture
        j: process.env.DB_JOURNAL === 'true', // EN: Journal write concern / FR: Préoccupation d'écriture de journal
        wtimeout: parseInt(process.env.DB_WRITE_TIMEOUT) || 10000 // EN: Write timeout / FR: Délai d'écriture
      }
    }
  },

  // EN: Schema options / FR: Options de schéma
  schema: {
    timestamps: true, // EN: Add createdAt and updatedAt timestamps / FR: Ajouter les horodatages createdAt et updatedAt
    versionKey: false, // EN: Disable version key / FR: Désactiver la clé de version
    strict: true, // EN: Strict mode for schemas / FR: Mode strict pour les schémas
    strictQuery: true, // EN: Strict mode for queries / FR: Mode strict pour les requêtes
    validateBeforeSave: true, // EN: Validate before saving / FR: Valider avant de sauvegarder
    autoIndex: process.env.NODE_ENV !== 'production', // EN: Auto create indexes in development / FR: Créer automatiquement les index en développement
    autoCreate: process.env.NODE_ENV !== 'production' // EN: Auto create collections in development / FR: Créer automatiquement les collections en développement
  },

  // EN: Index configuration / FR: Configuration des index
  indexes: {
    // EN: User indexes / FR: Index utilisateur
    users: [
      { email: 1 }, // EN: Unique email index / FR: Index email unique
      { 'contacts': 1 }, // EN: Contacts index / FR: Index contacts
      { 'blockedUsers': 1 }, // EN: Blocked users index / FR: Index utilisateurs bloqués
      { 'lastSeen': -1 }, // EN: Last seen index / FR: Index dernière vue
      { 'isDeleted': 1, 'isActive': 1 }, // EN: Compound index for active users / FR: Index composé pour les utilisateurs actifs
      { 'fcmToken': 1 }, // EN: FCM token index / FR: Index jeton FCM
      { 'socketId': 1 } // EN: Socket ID index / FR: Index ID socket
    ],

    // EN: Chat indexes / FR: Index chats
    chats: [
      { 'users.userId': 1 }, // EN: Users in chat index / FR: Index utilisateurs dans le chat
      { 'lastMessage': -1 }, // EN: Last message index / FR: Index dernier message
      { 'isGroupChat': 1 }, // EN: Group chat index / FR: Index chat de groupe
      { 'owner': 1 }, // EN: Owner index / FR: Index propriétaire
      { 'createdAt': -1 } // EN: Creation date index / FR: Index date de création
    ],

    // EN: Message indexes / FR: Index messages
    messages: [
      { 'chat': 1, 'createdAt': -1 }, // EN: Chat and date compound index / FR: Index composé chat et date
      { 'sender': 1 }, // EN: Sender index / FR: Index expéditeur
      { 'type': 1 }, // EN: Message type index / FR: Index type de message
      { 'isDeleted': 1 }, // EN: Deleted messages index / FR: Index messages supprimés
      { 'likes': 1 }, // EN: Likes index / FR: Index likes
      { 'replyTo': 1 } // EN: Reply to index / FR: Index réponse à
    ],

    // EN: Call indexes / FR: Index appels
    calls: [
      { 'participants.userId': 1 }, // EN: Participants index / FR: Index participants
      { 'startTime': -1 }, // EN: Start time index / FR: Index heure de début
      { 'status': 1 }, // EN: Call status index / FR: Index statut d'appel
      { 'type': 1 }, // EN: Call type index / FR: Index type d'appel
      { 'duration': -1 } // EN: Duration index / FR: Index durée
    ],

    // EN: File indexes / FR: Index fichiers
    files: [
      { 'uploadedBy': 1 }, // EN: Uploader index / FR: Index téléchargeur
      { 'type': 1 }, // EN: File type index / FR: Index type de fichier
      { 'category': 1 }, // EN: File category index / FR: Index catégorie de fichier
      { 'isDeleted': 1 }, // EN: Deleted files index / FR: Index fichiers supprimés
      { 'createdAt': -1 }, // EN: Creation date index / FR: Index date de création
      { 'size': -1 }, // EN: File size index / FR: Index taille de fichier
      { 'chat': 1 }, // EN: Chat index / FR: Index chat
      { 'message': 1 } // EN: Message index / FR: Index message
    ],

    // EN: Device indexes / FR: Index appareils
    devices: [
      { 'userId': 1 }, // EN: User index / FR: Index utilisateur
      { 'deviceId': 1 }, // EN: Device ID index / FR: Index ID appareil
      { 'platform': 1 }, // EN: Platform index / FR: Index plateforme
      { 'isValid': 1 }, // EN: Valid device index / FR: Index appareil valide
      { 'lastSeen': -1 } // EN: Last seen index / FR: Index dernière vue
    ],

    // EN: Status indexes / FR: Index statuts
    statuses: [
      { 'userId': 1, 'expiresAt': 1 }, // EN: User and expiration compound index / FR: Index composé utilisateur et expiration
      { 'expiresAt': 1 }, // EN: TTL index for automatic deletion / FR: Index TTL pour suppression automatique
      { 'type': 1 }, // EN: Status type index / FR: Index type de statut
      { 'visibility': 1 }, // EN: Visibility index / FR: Index visibilité
      { 'createdAt': -1 } // EN: Creation date index / FR: Index date de création
    ],

    // EN: Notification indexes / FR: Index notifications
    notifications: [
      { 'userId': 1, 'isRead': 1, 'createdAt': -1 }, // EN: User, read status and date compound index / FR: Index composé utilisateur, statut de lecture et date
      { 'type': 1 }, // EN: Notification type index / FR: Index type de notification
      { 'priority': 1 }, // EN: Priority index / FR: Index priorité
      { 'category': 1 }, // EN: Category index / FR: Index catégorie
      { 'isRead': 1 } // EN: Read status index / FR: Index statut de lecture
    ],

    // EN: Meeting indexes / FR: Index réunions
    meetings: [
      { 'organizer': 1, 'startTime': 1 }, // EN: Organizer and start time compound index / FR: Index composé organisateur et heure de début
      { 'participants.userId': 1 }, // EN: Participants index / FR: Index participants
      { 'status': 1 }, // EN: Meeting status index / FR: Index statut de réunion
      { 'type': 1 }, // EN: Meeting type index / FR: Index type de réunion
      { 'startTime': -1 } // EN: Start time index / FR: Index heure de début
    ],

    // EN: Search indexes / FR: Index recherches
    searches: [
      { 'userId': 1, 'query': 1, 'timestamp': -1 }, // EN: User, query and timestamp compound index / FR: Index composé utilisateur, requête et horodatage
      { 'query': 'text' }, // EN: Text index for full-text search / FR: Index textuel pour recherche en texte intégral
      { 'searchType': 1 }, // EN: Search type index / FR: Index type de recherche
      { 'timestamp': -1 } // EN: Timestamp index / FR: Index horodatage
    ],

    // EN: Network indexes / FR: Index réseau
    networks: [
      { 'userId': 1, 'deviceId': 1 }, // EN: User and device compound index / FR: Index composé utilisateur et appareil
      { 'connectionStatus.isConnected': 1 }, // EN: Connection status index / FR: Index statut de connexion
      { 'syncStatus.lastSync': 1 }, // EN: Last sync index / FR: Index dernière sync
      { 'backupSettings.nextBackup': 1 } // EN: Next backup index / FR: Index prochaine sauvegarde
    ]
  },

  // EN: Performance monitoring / FR: Surveillance des performances
  monitoring: {
    enableSlowQueryLog: process.env.ENABLE_SLOW_QUERY_LOG === 'true',
    slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD) || 100, // EN: Log queries slower than 100ms / FR: Enregistrer les requêtes plus lentes que 100ms
    enableQueryProfiling: process.env.ENABLE_QUERY_PROFILING === 'true',
    profilingLevel: parseInt(process.env.PROFILING_LEVEL) || 0 // EN: 0=off, 1=slow, 2=all / FR: 0=off, 1=lent, 2=tout
  },

  // EN: Backup configuration / FR: Configuration de sauvegarde
  backup: {
    enableAutomaticBackup: process.env.ENABLE_AUTO_BACKUP === 'true',
    backupFrequency: process.env.BACKUP_FREQUENCY || 'daily', // EN: daily, weekly, monthly / FR: quotidien, hebdomadaire, mensuel
    backupRetention: parseInt(process.env.BACKUP_RETENTION) || 30, // EN: Days to keep backups / FR: Jours de conservation des sauvegardes
    backupLocation: process.env.BACKUP_LOCATION || './backups'
  },

  // EN: Environment-specific settings / FR: Paramètres spécifiques à l'environnement
  environment: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test'
  }
};

/**
 * EN: Initialize database connection with enhanced configuration
 * FR: Initialiser la connexion à la base de données avec une configuration améliorée
 */
const initializeDatabase = async () => {
  try {
    // EN: Set mongoose options / FR: Définir les options mongoose
    mongoose.set('strictQuery', databaseConfig.schema.strictQuery);
    mongoose.set('autoIndex', databaseConfig.schema.autoIndex);
    mongoose.set('autoCreate', databaseConfig.schema.autoCreate);

    // EN: Connect to MongoDB / FR: Se connecter à MongoDB
    await mongoose.connect(
      databaseConfig.connection.uri,
      databaseConfig.connection.options
    );

    console.log('✅ Connected to MongoDB with enhanced configuration');

    // EN: Set up connection event listeners / FR: Configurer les écouteurs d'événements de connexion
    mongoose.connection.on('connected', () => {
      console.log('📡 MongoDB connected successfully');
    });

    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    // EN: Graceful shutdown / FR: Arrêt gracieux
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error);
        process.exit(1);
      }
    });

    return mongoose.connection;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
};

/**
 * EN: Create indexes for all collections
 * FR: Créer les index pour toutes les collections
 */
const createIndexes = async () => {
  try {
    console.log('🔍 Creating database indexes...');

    for (const [collectionName, indexes] of Object.entries(databaseConfig.indexes)) {
      try {
        const collection = mongoose.connection.db.collection(collectionName);
        
        for (const index of indexes) {
          try {
            await collection.createIndex(index);
            console.log(`✅ Created index for ${collectionName}:`, index);
          } catch (error) {
            if (error.code !== 85) { // EN: Index already exists / FR: Index existe déjà
              console.warn(`⚠️  Failed to create index for ${collectionName}:`, error.message);
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️  Failed to create indexes for ${collectionName}:`, error.message);
      }
    }

    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Failed to create database indexes:', error);
    throw error;
  }
};

/**
 * EN: Get database health status
 * FR: Obtenir le statut de santé de la base de données
 */
const getDatabaseHealth = async () => {
  try {
    const connectionState = mongoose.connection.readyState;
    const connectionStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    const health = {
      status: connectionStates[connectionState],
      readyState: connectionState,
      isHealthy: connectionState === 1,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      collections: await mongoose.connection.db.listCollections().toArray(),
      timestamp: new Date().toISOString()
    };

    return health;
  } catch (error) {
    return {
      status: 'error',
      isHealthy: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

export default {
  databaseConfig,
  initializeDatabase,
  createIndexes,
  getDatabaseHealth
};
