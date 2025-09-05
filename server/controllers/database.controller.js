/**
 * @file database.controller.js
 * @description
 * EN: This file contains controller functions for database verification and maintenance operations.
 * FR: Ce fichier contient les fonctions du contrôleur pour les opérations de vérification et de maintenance de base de données.
 */
import DatabaseVerificationService from '../services/databaseVerification.service.js';
import Errors from '../helpers/Errors.js';
import CatchAsyncError from '../helpers/CatchAsyncError.js';
import mongoose from 'mongoose';

/**
 * EN: Run complete database verification
 * FR: Exécuter une vérification complète de la base de données
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const verifyDatabase = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new DatabaseVerificationService();
    const results = await verificationService.runCompleteVerification();
    const summary = verificationService.getVerificationSummary();

    res.status(200).json({
      success: true,
      message: 'Database verification completed successfully',
      summary,
      results
    });
  } catch (error) {
    next(new Errors(`Database verification failed: ${error.message}`, 500));
  }
});

/**
 * EN: Get database connection status
 * FR: Récupérer le statut de connexion à la base de données
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getConnectionStatus = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new DatabaseVerificationService();
    const connectionStatus = await verificationService.verifyConnection();

    res.status(200).json({
      success: true,
      message: 'Connection status retrieved successfully',
      connection: connectionStatus
    });
  } catch (error) {
    next(new Errors(`Failed to get connection status: ${error.message}`, 500));
  }
});

/**
 * EN: Get collection statistics
 * FR: Récupérer les statistiques des collections
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getCollectionStats = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new DatabaseVerificationService();
    const collections = await verificationService.verifyCollections();

    res.status(200).json({
      success: true,
      message: 'Collection statistics retrieved successfully',
      collections
    });
  } catch (error) {
    next(new Errors(`Failed to get collection statistics: ${error.message}`, 500));
  }
});

/**
 * EN: Get index information
 * FR: Récupérer les informations d'index
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getIndexInfo = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new DatabaseVerificationService();
    const indexes = await verificationService.verifyIndexes();

    res.status(200).json({
      success: true,
      message: 'Index information retrieved successfully',
      indexes
    });
  } catch (error) {
    next(new Errors(`Failed to get index information: ${error.message}`, 500));
  }
});

/**
 * EN: Check data consistency
 * FR: Vérifier la cohérence des données
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const checkConsistency = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new DatabaseVerificationService();
    const consistency = await verificationService.verifyConsistency();

    res.status(200).json({
      success: true,
      message: 'Data consistency check completed successfully',
      consistency
    });
  } catch (error) {
    next(new Errors(`Failed to check data consistency: ${error.message}`, 500));
  }
});

/**
 * EN: Check database performance
 * FR: Vérifier les performances de la base de données
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const checkPerformance = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new DatabaseVerificationService();
    const performance = await verificationService.verifyPerformance();

    res.status(200).json({
      success: true,
      message: 'Database performance check completed successfully',
      performance
    });
  } catch (error) {
    next(new Errors(`Failed to check database performance: ${error.message}`, 500));
  }
});

/**
 * EN: Get database health summary
 * FR: Récupérer le résumé de santé de la base de données
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getHealthSummary = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new DatabaseVerificationService();
    
    // EN: Run quick checks / FR: Exécuter des vérifications rapides
    await verificationService.verifyConnection();
    await verificationService.verifyCollections();
    await verificationService.verifyIndexes();
    await verificationService.verifyConsistency();
    await verificationService.verifyPerformance();
    verificationService.generateRecommendations();

    const summary = verificationService.getVerificationSummary();

    res.status(200).json({
      success: true,
      message: 'Database health summary retrieved successfully',
      summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(new Errors(`Failed to get database health summary: ${error.message}`, 500));
  }
});

/**
 * EN: Get database server information
 * FR: Récupérer les informations du serveur de base de données
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getServerInfo = CatchAsyncError(async (req, res, next) => {
  try {
    const admin = mongoose.connection.db.admin();
    const serverInfo = await admin.serverInfo();
    const buildInfo = await admin.buildInfo();

    res.status(200).json({
      success: true,
      message: 'Database server information retrieved successfully',
      server: {
        version: serverInfo.version,
        gitVersion: serverInfo.gitVersion,
        sysInfo: serverInfo.sysInfo,
        versionArray: serverInfo.versionArray,
        buildInfo: {
          version: buildInfo.version,
          gitVersion: buildInfo.gitVersion,
          targetMinOS: buildInfo.targetMinOS,
          bits: buildInfo.bits,
          debug: buildInfo.debug,
          maxBsonObjectSize: buildInfo.maxBsonObjectSize,
          javascriptEngine: buildInfo.javascriptEngine
        }
      }
    });
  } catch (error) {
    next(new Errors(`Failed to get database server information: ${error.message}`, 500));
  }
});

/**
 * EN: Get database statistics
 * FR: Récupérer les statistiques de la base de données
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getDatabaseStats = CatchAsyncError(async (req, res, next) => {
  try {
    const db = mongoose.connection.db;
    const stats = await db.stats();

    res.status(200).json({
      success: true,
      message: 'Database statistics retrieved successfully',
      stats: {
        db: stats.db,
        collections: stats.collections,
        views: stats.views,
        objects: stats.objects,
        avgObjSize: stats.avgObjSize,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize,
        totalSize: stats.totalSize,
        scaleFactor: stats.scaleFactor,
        fsUsedSize: stats.fsUsedSize,
        fsTotalSize: stats.fsTotalSize,
        ok: stats.ok
      }
    });
  } catch (error) {
    next(new Errors(`Failed to get database statistics: ${error.message}`, 500));
  }
});

/**
 * EN: Clean up orphaned data
 * FR: Nettoyer les données orphelines
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const cleanupOrphanedData = CatchAsyncError(async (req, res, next) => {
  try {
    const { dryRun = true } = req.query;
    const cleanupResults = [];

    // EN: Clean up orphaned messages / FR: Nettoyer les messages orphelins
    try {
      const orphanedMessages = await mongoose.connection.db.collection('messages').aggregate([
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
      ]).toArray();

      if (!dryRun && orphanedMessages.length > 0) {
        const deleteResult = await mongoose.connection.db.collection('messages').deleteMany({
          _id: { $in: orphanedMessages.map(msg => msg._id) }
        });
        cleanupResults.push({
          collection: 'messages',
          action: 'deleted',
          count: deleteResult.deletedCount
        });
      } else {
        cleanupResults.push({
          collection: 'messages',
          action: dryRun ? 'would_delete' : 'none',
          count: orphanedMessages.length
        });
      }
    } catch (error) {
      cleanupResults.push({
        collection: 'messages',
        action: 'error',
        error: error.message
      });
    }

    // EN: Clean up orphaned files / FR: Nettoyer les fichiers orphelins
    try {
      const orphanedFiles = await mongoose.connection.db.collection('files').aggregate([
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
      ]).toArray();

      if (!dryRun && orphanedFiles.length > 0) {
        const deleteResult = await mongoose.connection.db.collection('files').deleteMany({
          _id: { $in: orphanedFiles.map(file => file._id) }
        });
        cleanupResults.push({
          collection: 'files',
          action: 'deleted',
          count: deleteResult.deletedCount
        });
      } else {
        cleanupResults.push({
          collection: 'files',
          action: dryRun ? 'would_delete' : 'none',
          count: orphanedFiles.length
        });
      }
    } catch (error) {
      cleanupResults.push({
        collection: 'files',
        action: 'error',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: `Cleanup ${dryRun ? 'simulation' : 'completed'} successfully`,
      dryRun,
      results: cleanupResults
    });
  } catch (error) {
    next(new Errors(`Failed to cleanup orphaned data: ${error.message}`, 500));
  }
});

/**
 * EN: Optimize database indexes
 * FR: Optimiser les index de base de données
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const optimizeIndexes = CatchAsyncError(async (req, res, next) => {
  try {
    const { collection } = req.params;
    const results = [];

    if (collection) {
      // EN: Optimize specific collection / FR: Optimiser une collection spécifique
      const result = await mongoose.connection.db.collection(collection).reIndex();
      results.push({
        collection,
        action: 'reindexed',
        result
      });
    } else {
      // EN: Optimize all collections / FR: Optimiser toutes les collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      for (const coll of collections) {
        try {
          const result = await mongoose.connection.db.collection(coll.name).reIndex();
          results.push({
            collection: coll.name,
            action: 'reindexed',
            result
          });
        } catch (error) {
          results.push({
            collection: coll.name,
            action: 'error',
            error: error.message
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Index optimization completed successfully',
      results
    });
  } catch (error) {
    next(new Errors(`Failed to optimize indexes: ${error.message}`, 500));
  }
});

export default {
  verifyDatabase,
  getConnectionStatus,
  getCollectionStats,
  getIndexInfo,
  checkConsistency,
  checkPerformance,
  getHealthSummary,
  getServerInfo,
  getDatabaseStats,
  cleanupOrphanedData,
  optimizeIndexes
};
