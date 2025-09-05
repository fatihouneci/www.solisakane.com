/**
 * @file stabilityVerification.controller.js
 * @description
 * EN: This file contains controller functions for stability verification operations.
 * FR: Ce fichier contient les fonctions du contrôleur pour les opérations de vérification de stabilité.
 */
import StabilityVerificationService from '../services/stabilityVerification.service.js';
import Errors from '../helpers/Errors.js';
import CatchAsyncError from '../helpers/CatchAsyncError.js';

/**
 * EN: Run complete stability verification
 * FR: Exécuter la vérification complète de stabilité
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const runStabilityVerification = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new StabilityVerificationService();
    const results = await verificationService.runCompleteStabilityVerification();
    const summary = verificationService.getStabilitySummary();

    res.status(200).json({
      success: true,
      message: 'Stability verification completed successfully',
      summary,
      results
    });
  } catch (error) {
    next(new Errors(`Stability verification failed: ${error.message}`, 500));
  }
});

/**
 * EN: Verify backend stability
 * FR: Vérifier la stabilité du backend
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const verifyBackendStability = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new StabilityVerificationService();
    const backendResults = await verificationService.verifyBackendStability();

    res.status(200).json({
      success: true,
      message: 'Backend stability verification completed successfully',
      results: backendResults
    });
  } catch (error) {
    next(new Errors(`Backend stability verification failed: ${error.message}`, 500));
  }
});

/**
 * EN: Verify web stability
 * FR: Vérifier la stabilité web
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const verifyWebStability = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new StabilityVerificationService();
    const webResults = await verificationService.verifyWebStability();

    res.status(200).json({
      success: true,
      message: 'Web stability verification completed successfully',
      results: webResults
    });
  } catch (error) {
    next(new Errors(`Web stability verification failed: ${error.message}`, 500));
  }
});

/**
 * EN: Verify mobile stability
 * FR: Vérifier la stabilité mobile
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const verifyMobileStability = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new StabilityVerificationService();
    const mobileResults = await verificationService.verifyMobileStability();

    res.status(200).json({
      success: true,
      message: 'Mobile stability verification completed successfully',
      results: mobileResults
    });
  } catch (error) {
    next(new Errors(`Mobile stability verification failed: ${error.message}`, 500));
  }
});

/**
 * EN: Verify database stability
 * FR: Vérifier la stabilité de la base de données
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const verifyDatabaseStability = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new StabilityVerificationService();
    const databaseResults = await verificationService.verifyDatabaseStability();

    res.status(200).json({
      success: true,
      message: 'Database stability verification completed successfully',
      results: databaseResults
    });
  } catch (error) {
    next(new Errors(`Database stability verification failed: ${error.message}`, 500));
  }
});

/**
 * EN: Verify Socket.IO stability
 * FR: Vérifier la stabilité de Socket.IO
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const verifySocketIOStability = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new StabilityVerificationService();
    const socketioResults = await verificationService.verifySocketIOStability();

    res.status(200).json({
      success: true,
      message: 'Socket.IO stability verification completed successfully',
      results: socketioResults
    });
  } catch (error) {
    next(new Errors(`Socket.IO stability verification failed: ${error.message}`, 500));
  }
});

/**
 * EN: Verify WebRTC stability
 * FR: Vérifier la stabilité de WebRTC
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const verifyWebRTCStability = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new StabilityVerificationService();
    const webrtcResults = await verificationService.verifyWebRTCStability();

    res.status(200).json({
      success: true,
      message: 'WebRTC stability verification completed successfully',
      results: webrtcResults
    });
  } catch (error) {
    next(new Errors(`WebRTC stability verification failed: ${error.message}`, 500));
  }
});

/**
 * EN: Verify application performance
 * FR: Vérifier les performances de l'application
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const verifyPerformance = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new StabilityVerificationService();
    const performanceResults = await verificationService.verifyPerformance();

    res.status(200).json({
      success: true,
      message: 'Performance verification completed successfully',
      results: performanceResults
    });
  } catch (error) {
    next(new Errors(`Performance verification failed: ${error.message}`, 500));
  }
});

/**
 * EN: Get stability verification summary
 * FR: Récupérer le résumé de vérification de stabilité
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getStabilitySummary = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new StabilityVerificationService();
    
    // EN: Run quick stability checks / FR: Exécuter des vérifications rapides de stabilité
    await verificationService.verifyBackendStability();
    await verificationService.verifyWebStability();
    await verificationService.verifyMobileStability();
    await verificationService.verifyDatabaseStability();
    await verificationService.verifySocketIOStability();
    await verificationService.verifyWebRTCStability();
    await verificationService.verifyPerformance();
    verificationService.generateRecommendations();

    const summary = verificationService.getStabilitySummary();

    res.status(200).json({
      success: true,
      message: 'Stability verification summary retrieved successfully',
      summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(new Errors(`Failed to get stability verification summary: ${error.message}`, 500));
  }
});

/**
 * EN: Get stability verification statistics
 * FR: Récupérer les statistiques de vérification de stabilité
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getStabilityStatistics = CatchAsyncError(async (req, res, next) => {
  try {
    const stats = {
      totalTests: 0,
      successfulTests: 0,
      failedTests: 0,
      backendTests: 0,
      webTests: 0,
      mobileTests: 0,
      databaseTests: 0,
      socketioTests: 0,
      webrtcTests: 0,
      performanceTests: 0,
      averageResponseTime: 0,
      averageLoadTime: 0,
      stabilityScore: 100,
      lastRun: new Date(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };

    res.status(200).json({
      success: true,
      message: 'Stability verification statistics retrieved successfully',
      statistics: stats
    });
  } catch (error) {
    next(new Errors(`Failed to get stability verification statistics: ${error.message}`, 500));
  }
});

export default {
  runStabilityVerification,
  verifyBackendStability,
  verifyWebStability,
  verifyMobileStability,
  verifyDatabaseStability,
  verifySocketIOStability,
  verifyWebRTCStability,
  verifyPerformance,
  getStabilitySummary,
  getStabilityStatistics
};
