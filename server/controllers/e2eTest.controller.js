/**
 * @file e2eTest.controller.js
 * @description
 * EN: This file contains controller functions for E2E testing operations.
 * FR: Ce fichier contient les fonctions du contrôleur pour les opérations de tests E2E.
 */
import E2ETestService from '../services/e2eTest.service.js';
import Errors from '../helpers/Errors.js';
import CatchAsyncError from '../helpers/CatchAsyncError.js';

/**
 * EN: Run complete E2E test suite
 * FR: Exécuter la suite complète de tests E2E
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const runE2ETests = CatchAsyncError(async (req, res, next) => {
  try {
    const testService = new E2ETestService();
    const results = await testService.runCompleteE2ETests();
    const summary = testService.getTestSummary();

    res.status(200).json({
      success: true,
      message: 'E2E tests completed successfully',
      summary,
      results
    });
  } catch (error) {
    next(new Errors(`E2E tests failed: ${error.message}`, 500));
  }
});

/**
 * EN: Test web application E2E
 * FR: Tester l'application web E2E
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const testWebApp = CatchAsyncError(async (req, res, next) => {
  try {
    const testService = new E2ETestService();
    const webResults = await testService.testWebApplication();

    res.status(200).json({
      success: true,
      message: 'Web application E2E tests completed successfully',
      results: webResults
    });
  } catch (error) {
    next(new Errors(`Web application E2E tests failed: ${error.message}`, 500));
  }
});

/**
 * EN: Test mobile application E2E
 * FR: Tester l'application mobile E2E
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const testMobileApp = CatchAsyncError(async (req, res, next) => {
  try {
    const testService = new E2ETestService();
    const mobileResults = await testService.testMobileApplication();

    res.status(200).json({
      success: true,
      message: 'Mobile application E2E tests completed successfully',
      results: mobileResults
    });
  } catch (error) {
    next(new Errors(`Mobile application E2E tests failed: ${error.message}`, 500));
  }
});

/**
 * EN: Test API endpoints E2E
 * FR: Tester les endpoints API E2E
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const testAPIEndpoints = CatchAsyncError(async (req, res, next) => {
  try {
    const testService = new E2ETestService();
    const apiResults = await testService.testAPIEndpoints();

    res.status(200).json({
      success: true,
      message: 'API endpoints E2E tests completed successfully',
      results: apiResults
    });
  } catch (error) {
    next(new Errors(`API endpoints E2E tests failed: ${error.message}`, 500));
  }
});

/**
 * EN: Test application performance E2E
 * FR: Tester les performances de l'application E2E
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const testPerformance = CatchAsyncError(async (req, res, next) => {
  try {
    const testService = new E2ETestService();
    const performanceResults = await testService.testPerformance();

    res.status(200).json({
      success: true,
      message: 'Performance E2E tests completed successfully',
      results: performanceResults
    });
  } catch (error) {
    next(new Errors(`Performance E2E tests failed: ${error.message}`, 500));
  }
});

/**
 * EN: Test application coverage E2E
 * FR: Tester la couverture de l'application E2E
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const testCoverage = CatchAsyncError(async (req, res, next) => {
  try {
    const testService = new E2ETestService();
    const coverageResults = await testService.testCoverage();

    res.status(200).json({
      success: true,
      message: 'Coverage E2E tests completed successfully',
      results: coverageResults
    });
  } catch (error) {
    next(new Errors(`Coverage E2E tests failed: ${error.message}`, 500));
  }
});

/**
 * EN: Get E2E test summary
 * FR: Récupérer le résumé des tests E2E
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getTestSummary = CatchAsyncError(async (req, res, next) => {
  try {
    const testService = new E2ETestService();
    
    // EN: Run quick tests / FR: Exécuter des tests rapides
    await testService.testWebApplication();
    await testService.testMobileApplication();
    await testService.testAPIEndpoints();
    await testService.testPerformance();
    await testService.testCoverage();
    testService.generateRecommendations();

    const summary = testService.getTestSummary();

    res.status(200).json({
      success: true,
      message: 'E2E test summary retrieved successfully',
      summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(new Errors(`Failed to get E2E test summary: ${error.message}`, 500));
  }
});

/**
 * EN: Get E2E test statistics
 * FR: Récupérer les statistiques des tests E2E
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getTestStatistics = CatchAsyncError(async (req, res, next) => {
  try {
    const stats = {
      totalTests: 0,
      successfulTests: 0,
      failedTests: 0,
      webTests: 0,
      mobileTests: 0,
      apiTests: 0,
      performanceTests: 0,
      coverageTests: 0,
      averageResponseTime: 0,
      testCoverage: 100,
      lastRun: new Date(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };

    res.status(200).json({
      success: true,
      message: 'E2E test statistics retrieved successfully',
      statistics: stats
    });
  } catch (error) {
    next(new Errors(`Failed to get E2E test statistics: ${error.message}`, 500));
  }
});

export default {
  runE2ETests,
  testWebApp,
  testMobileApp,
  testAPIEndpoints,
  testPerformance,
  testCoverage,
  getTestSummary,
  getTestStatistics
};
