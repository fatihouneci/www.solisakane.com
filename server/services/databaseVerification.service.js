/**
 * @file databaseVerification.service.js
 * @description
 * EN: This service provides comprehensive database verification, consistency checks, and data integrity validation.
 * FR: Ce service fournit une vérification complète de la base de données, des vérifications de cohérence et une validation de l'intégrité des données.
 */
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Chat from '../models/chat.model.js';
import Message from '../models/message.model.js';
import Call from '../models/call.model.js';
import File from '../models/file.model.js';
import Device from '../models/device.model.js';
import Status from '../models/status.model.js';
import Notification from '../models/notification.model.js';
import Meeting from '../models/meeting.model.js';
import Search from '../models/search.model.js';
import Network from '../models/network.model.js';

class DatabaseVerificationService {
  constructor() {
    this.verificationResults = {
      connection: null,
      collections: {},
      indexes: {},
      consistency: {},
      performance: {},
      recommendations: []
    };
  }

  /**
   * EN: Verify database connection and basic connectivity
   * FR: Vérifier la connexion à la base de données et la connectivité de base
   */
  async verifyConnection() {
    try {
      const startTime = Date.now();
      
      // EN: Check connection status / FR: Vérifier le statut de connexion
      const connectionState = mongoose.connection.readyState;
      const connectionStates = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };

      // EN: Test basic query / FR: Tester une requête de base
      const testQuery = await User.findOne().limit(1);
      const queryTime = Date.now() - startTime;

      this.verificationResults.connection = {
        status: connectionStates[connectionState],
        readyState: connectionState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
        queryTime: queryTime,
        isHealthy: connectionState === 1 && queryTime < 1000
      };

      return this.verificationResults.connection;
    } catch (error) {
      this.verificationResults.connection = {
        status: 'error',
        error: error.message,
        isHealthy: false
      };
      throw error;
    }
  }

  /**
   * EN: Verify all collections and their schemas
   * FR: Vérifier toutes les collections et leurs schémas
   */
  async verifyCollections() {
    const collections = [
      { name: 'users', model: User },
      { name: 'chats', model: Chat },
      { name: 'messages', model: Message },
      { name: 'calls', model: Call },
      { name: 'files', model: File },
      { name: 'devices', model: Device },
      { name: 'statuses', model: Status },
      { name: 'notifications', model: Notification },
      { name: 'meetings', model: Meeting },
      { name: 'searches', model: Search },
      { name: 'networks', model: Network }
    ];

    for (const collection of collections) {
      try {
        const startTime = Date.now();
        
        // EN: Get collection stats / FR: Obtenir les statistiques de collection
        const stats = await mongoose.connection.db.collection(collection.name).stats();
        
        // EN: Count documents / FR: Compter les documents
        const count = await collection.model.countDocuments();
        
        // EN: Get sample document / FR: Obtenir un document d'exemple
        const sample = await collection.model.findOne();
        
        // EN: Verify schema validation / FR: Vérifier la validation du schéma
        const schemaValidation = this.validateSchema(collection.model, sample);

        this.verificationResults.collections[collection.name] = {
          exists: true,
          documentCount: count,
          size: stats.size,
          avgObjSize: stats.avgObjSize,
          totalIndexSize: stats.totalIndexSize,
          queryTime: Date.now() - startTime,
          schemaValidation,
          sampleDocument: sample ? Object.keys(sample.toObject()) : [],
          isHealthy: count >= 0 && schemaValidation.isValid
        };
      } catch (error) {
        this.verificationResults.collections[collection.name] = {
          exists: false,
          error: error.message,
          isHealthy: false
        };
      }
    }

    return this.verificationResults.collections;
  }

  /**
   * EN: Validate schema structure and constraints
   * FR: Valider la structure du schéma et les contraintes
   */
  validateSchema(model, sample) {
    const schema = model.schema;
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      requiredFields: [],
      optionalFields: [],
      indexes: []
    };

    try {
      // EN: Check required fields / FR: Vérifier les champs requis
      const paths = schema.paths;
      for (const [pathName, path] of Object.entries(paths)) {
        if (path.isRequired) {
          validation.requiredFields.push(pathName);
        } else {
          validation.optionalFields.push(pathName);
        }

        // EN: Check field types / FR: Vérifier les types de champs
        if (path.instance && path.instance !== path.type.name) {
          validation.warnings.push(`Field ${pathName} has type mismatch: ${path.instance} vs ${path.type.name}`);
        }
      }

      // EN: Check indexes / FR: Vérifier les index
      const indexes = schema.indexes();
      validation.indexes = indexes.map(index => ({
        fields: index[0],
        options: index[1] || {}
      }));

      // EN: Validate sample document if provided / FR: Valider le document d'exemple si fourni
      if (sample) {
        const sampleObj = sample.toObject();
        for (const requiredField of validation.requiredFields) {
          if (!(requiredField in sampleObj)) {
            validation.errors.push(`Required field ${requiredField} is missing in sample document`);
            validation.isValid = false;
          }
        }
      }

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Schema validation error: ${error.message}`);
    }

    return validation;
  }

  /**
   * EN: Verify database indexes and their performance
   * FR: Vérifier les index de base de données et leurs performances
   */
  async verifyIndexes() {
    const collections = ['users', 'chats', 'messages', 'calls', 'files', 'devices', 'statuses', 'notifications', 'meetings', 'searches', 'networks'];

    for (const collectionName of collections) {
      try {
        const startTime = Date.now();
        
        // EN: Get index information / FR: Obtenir les informations d'index
        const indexes = await mongoose.connection.db.collection(collectionName).indexes();
        
        // EN: Analyze index usage / FR: Analyser l'utilisation des index
        const indexStats = await mongoose.connection.db.collection(collectionName).aggregate([
          { $indexStats: {} }
        ]).toArray();

        this.verificationResults.indexes[collectionName] = {
          count: indexes.length,
          indexes: indexes.map(index => ({
            name: index.name,
            key: index.key,
            unique: index.unique || false,
            sparse: index.sparse || false,
            background: index.background || false
          })),
          stats: indexStats,
          queryTime: Date.now() - startTime,
          isHealthy: indexes.length > 0
        };
      } catch (error) {
        this.verificationResults.indexes[collectionName] = {
          error: error.message,
          isHealthy: false
        };
      }
    }

    return this.verificationResults.indexes;
  }

  /**
   * EN: Verify data consistency across collections
   * FR: Vérifier la cohérence des données entre les collections
   */
  async verifyConsistency() {
    const consistencyChecks = [];

    // EN: Check user references in chats / FR: Vérifier les références utilisateur dans les chats
    try {
      const orphanedChats = await Chat.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'users.userId',
            foreignField: '_id',
            as: 'validUsers'
          }
        },
        {
          $match: {
            $expr: { $lt: [{ $size: '$validUsers' }, { $size: '$users' }] }
          }
        }
      ]);

      consistencyChecks.push({
        name: 'Chat User References',
        status: orphanedChats.length === 0 ? 'healthy' : 'warning',
        count: orphanedChats.length,
        message: orphanedChats.length === 0 ? 
          'All chat user references are valid' : 
          `Found ${orphanedChats.length} chats with invalid user references`
      });
    } catch (error) {
      consistencyChecks.push({
        name: 'Chat User References',
        status: 'error',
        error: error.message
      });
    }

    // EN: Check message references in chats / FR: Vérifier les références de messages dans les chats
    try {
      const orphanedMessages = await Message.aggregate([
        {
          $lookup: {
            from: 'chats',
            localField: 'chat',
            foreignField: '_id',
            as: 'validChat'
          }
        },
        {
          $match: {
            $expr: { $eq: [{ $size: '$validChat' }, 0] }
          }
        }
      ]);

      consistencyChecks.push({
        name: 'Message Chat References',
        status: orphanedMessages.length === 0 ? 'healthy' : 'warning',
        count: orphanedMessages.length,
        message: orphanedMessages.length === 0 ? 
          'All message chat references are valid' : 
          `Found ${orphanedMessages.length} messages with invalid chat references`
      });
    } catch (error) {
      consistencyChecks.push({
        name: 'Message Chat References',
        status: 'error',
        error: error.message
      });
    }

    // EN: Check file references / FR: Vérifier les références de fichiers
    try {
      const orphanedFiles = await File.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'uploadedBy',
            foreignField: '_id',
            as: 'validUser'
          }
        },
        {
          $match: {
            $expr: { $eq: [{ $size: '$validUser' }, 0] }
          }
        }
      ]);

      consistencyChecks.push({
        name: 'File User References',
        status: orphanedFiles.length === 0 ? 'healthy' : 'warning',
        count: orphanedFiles.length,
        message: orphanedFiles.length === 0 ? 
          'All file user references are valid' : 
          `Found ${orphanedFiles.length} files with invalid user references`
      });
    } catch (error) {
      consistencyChecks.push({
        name: 'File User References',
        status: 'error',
        error: error.message
      });
    }

    // EN: Check device references / FR: Vérifier les références d'appareils
    try {
      const orphanedDevices = await Device.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'validUser'
          }
        },
        {
          $match: {
            $expr: { $eq: [{ $size: '$validUser' }, 0] }
          }
        }
      ]);

      consistencyChecks.push({
        name: 'Device User References',
        status: orphanedDevices.length === 0 ? 'healthy' : 'warning',
        count: orphanedDevices.length,
        message: orphanedDevices.length === 0 ? 
          'All device user references are valid' : 
          `Found ${orphanedDevices.length} devices with invalid user references`
      });
    } catch (error) {
      consistencyChecks.push({
        name: 'Device User References',
        status: 'error',
        error: error.message
      });
    }

    // EN: Check notification references / FR: Vérifier les références de notifications
    try {
      const orphanedNotifications = await Notification.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'validUser'
          }
        },
        {
          $match: {
            $expr: { $eq: [{ $size: '$validUser' }, 0] }
          }
        }
      ]);

      consistencyChecks.push({
        name: 'Notification User References',
        status: orphanedNotifications.length === 0 ? 'healthy' : 'warning',
        count: orphanedNotifications.length,
        message: orphanedNotifications.length === 0 ? 
          'All notification user references are valid' : 
          `Found ${orphanedNotifications.length} notifications with invalid user references`
      });
    } catch (error) {
      consistencyChecks.push({
        name: 'Notification User References',
        status: 'error',
        error: error.message
      });
    }

    this.verificationResults.consistency = {
      checks: consistencyChecks,
      overallStatus: consistencyChecks.every(check => check.status === 'healthy') ? 'healthy' : 'warning',
      healthyChecks: consistencyChecks.filter(check => check.status === 'healthy').length,
      totalChecks: consistencyChecks.length
    };

    return this.verificationResults.consistency;
  }

  /**
   * EN: Verify database performance and query optimization
   * FR: Vérifier les performances de la base de données et l'optimisation des requêtes
   */
  async verifyPerformance() {
    const performanceTests = [];

    // EN: Test user query performance / FR: Tester les performances des requêtes utilisateur
    try {
      const startTime = Date.now();
      await User.find({ email: { $exists: true } }).limit(100);
      const queryTime = Date.now() - startTime;

      performanceTests.push({
        name: 'User Query Performance',
        queryTime: queryTime,
        status: queryTime < 100 ? 'excellent' : queryTime < 500 ? 'good' : 'needs_optimization',
        message: `User query took ${queryTime}ms`
      });
    } catch (error) {
      performanceTests.push({
        name: 'User Query Performance',
        status: 'error',
        error: error.message
      });
    }

    // EN: Test message query performance / FR: Tester les performances des requêtes de messages
    try {
      const startTime = Date.now();
      await Message.find({ chat: { $exists: true } }).limit(100);
      const queryTime = Date.now() - startTime;

      performanceTests.push({
        name: 'Message Query Performance',
        queryTime: queryTime,
        status: queryTime < 100 ? 'excellent' : queryTime < 500 ? 'good' : 'needs_optimization',
        message: `Message query took ${queryTime}ms`
      });
    } catch (error) {
      performanceTests.push({
        name: 'Message Query Performance',
        status: 'error',
        error: error.message
      });
    }

    // EN: Test aggregation performance / FR: Tester les performances d'agrégation
    try {
      const startTime = Date.now();
      await User.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]);
      const queryTime = Date.now() - startTime;

      performanceTests.push({
        name: 'Aggregation Performance',
        queryTime: queryTime,
        status: queryTime < 200 ? 'excellent' : queryTime < 1000 ? 'good' : 'needs_optimization',
        message: `Aggregation query took ${queryTime}ms`
      });
    } catch (error) {
      performanceTests.push({
        name: 'Aggregation Performance',
        status: 'error',
        error: error.message
      });
    }

    this.verificationResults.performance = {
      tests: performanceTests,
      overallStatus: performanceTests.every(test => test.status === 'excellent' || test.status === 'good') ? 'good' : 'needs_optimization',
      averageQueryTime: performanceTests.reduce((sum, test) => sum + (test.queryTime || 0), 0) / performanceTests.length
    };

    return this.verificationResults.performance;
  }

  /**
   * EN: Generate database optimization recommendations
   * FR: Générer des recommandations d'optimisation de base de données
   */
  generateRecommendations() {
    const recommendations = [];

    // EN: Analyze collection health / FR: Analyser la santé des collections
    const unhealthyCollections = Object.entries(this.verificationResults.collections)
      .filter(([name, data]) => !data.isHealthy);

    if (unhealthyCollections.length > 0) {
      recommendations.push({
        type: 'critical',
        category: 'collections',
        message: `Found ${unhealthyCollections.length} unhealthy collections: ${unhealthyCollections.map(([name]) => name).join(', ')}`,
        action: 'Investigate and fix collection issues'
      });
    }

    // EN: Analyze index health / FR: Analyser la santé des index
    const collectionsWithoutIndexes = Object.entries(this.verificationResults.indexes)
      .filter(([name, data]) => !data.isHealthy || data.count === 0);

    if (collectionsWithoutIndexes.length > 0) {
      recommendations.push({
        type: 'high',
        category: 'indexes',
        message: `Collections without proper indexes: ${collectionsWithoutIndexes.map(([name]) => name).join(', ')}`,
        action: 'Add appropriate indexes for better query performance'
      });
    }

    // EN: Analyze consistency issues / FR: Analyser les problèmes de cohérence
    const consistencyIssues = this.verificationResults.consistency.checks
      .filter(check => check.status !== 'healthy');

    if (consistencyIssues.length > 0) {
      recommendations.push({
        type: 'medium',
        category: 'consistency',
        message: `Found ${consistencyIssues.length} consistency issues`,
        action: 'Run data cleanup and fix referential integrity'
      });
    }

    // EN: Analyze performance issues / FR: Analyser les problèmes de performance
    const performanceIssues = this.verificationResults.performance.tests
      .filter(test => test.status === 'needs_optimization');

    if (performanceIssues.length > 0) {
      recommendations.push({
        type: 'medium',
        category: 'performance',
        message: `Found ${performanceIssues.length} performance issues`,
        action: 'Optimize queries and add missing indexes'
      });
    }

    // EN: General recommendations / FR: Recommandations générales
    recommendations.push({
      type: 'low',
      category: 'maintenance',
      message: 'Regular database maintenance recommended',
      action: 'Schedule regular database health checks and cleanup'
    });

    this.verificationResults.recommendations = recommendations;
    return recommendations;
  }

  /**
   * EN: Run complete database verification
   * FR: Exécuter une vérification complète de la base de données
   */
  async runCompleteVerification() {
    console.log('🔍 Starting comprehensive database verification...');

    try {
      // EN: Verify connection / FR: Vérifier la connexion
      console.log('📡 Verifying database connection...');
      await this.verifyConnection();

      // EN: Verify collections / FR: Vérifier les collections
      console.log('📚 Verifying collections and schemas...');
      await this.verifyCollections();

      // EN: Verify indexes / FR: Vérifier les index
      console.log('🔍 Verifying database indexes...');
      await this.verifyIndexes();

      // EN: Verify consistency / FR: Vérifier la cohérence
      console.log('🔗 Verifying data consistency...');
      await this.verifyConsistency();

      // EN: Verify performance / FR: Vérifier les performances
      console.log('⚡ Verifying database performance...');
      await this.verifyPerformance();

      // EN: Generate recommendations / FR: Générer des recommandations
      console.log('💡 Generating optimization recommendations...');
      this.generateRecommendations();

      console.log('✅ Database verification completed successfully!');
      return this.verificationResults;

    } catch (error) {
      console.error('❌ Database verification failed:', error);
      throw error;
    }
  }

  /**
   * EN: Get verification summary
   * FR: Obtenir le résumé de vérification
   */
  getVerificationSummary() {
    const summary = {
      overallHealth: 'healthy',
      connection: this.verificationResults.connection?.isHealthy ? 'healthy' : 'unhealthy',
      collections: Object.values(this.verificationResults.collections).every(c => c.isHealthy) ? 'healthy' : 'issues',
      indexes: Object.values(this.verificationResults.indexes).every(i => i.isHealthy) ? 'healthy' : 'issues',
      consistency: this.verificationResults.consistency?.overallStatus || 'unknown',
      performance: this.verificationResults.performance?.overallStatus || 'unknown',
      totalRecommendations: this.verificationResults.recommendations?.length || 0,
      criticalIssues: this.verificationResults.recommendations?.filter(r => r.type === 'critical').length || 0
    };

    // EN: Determine overall health / FR: Déterminer la santé globale
    if (summary.connection === 'unhealthy' || summary.criticalIssues > 0) {
      summary.overallHealth = 'critical';
    } else if (summary.collections === 'issues' || summary.indexes === 'issues') {
      summary.overallHealth = 'warning';
    }

    return summary;
  }
}

export default DatabaseVerificationService;
