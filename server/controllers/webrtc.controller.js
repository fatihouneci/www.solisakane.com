/**
 * @file webrtc.controller.js
 * @description
 * EN: This file contains controller functions for WebRTC verification and monitoring operations.
 * FR: Ce fichier contient les fonctions du contrôleur pour les opérations de vérification et de monitoring WebRTC.
 */
import WebRTCVerificationService from '../services/webrtcVerification.service.js';
import Errors from '../helpers/Errors.js';
import CatchAsyncError from '../helpers/CatchAsyncError.js';

/**
 * EN: Run complete WebRTC verification
 * FR: Exécuter une vérification complète WebRTC
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const verifyWebRTC = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new WebRTCVerificationService();
    const results = await verificationService.runCompleteVerification();
    const summary = verificationService.getVerificationSummary();

    res.status(200).json({
      success: true,
      message: 'WebRTC verification completed successfully',
      summary,
      results
    });
  } catch (error) {
    next(new Errors(`WebRTC verification failed: ${error.message}`, 500));
  }
});

/**
 * EN: Get mediasoup status
 * FR: Récupérer le statut mediasoup
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getMediasoupStatus = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new WebRTCVerificationService();
    const mediasoupStatus = await verificationService.testMediasoupFunctionality();

    res.status(200).json({
      success: true,
      message: 'Mediasoup status retrieved successfully',
      mediasoup: mediasoupStatus
    });
  } catch (error) {
    next(new Errors(`Failed to get mediasoup status: ${error.message}`, 500));
  }
});

/**
 * EN: Get React Native WebRTC status
 * FR: Récupérer le statut WebRTC React Native
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getReactNativeWebRTCStatus = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new WebRTCVerificationService();
    const reactNativeStatus = await verificationService.testReactNativeWebRTC();

    res.status(200).json({
      success: true,
      message: 'React Native WebRTC status retrieved successfully',
      reactNative: reactNativeStatus
    });
  } catch (error) {
    next(new Errors(`Failed to get React Native WebRTC status: ${error.message}`, 500));
  }
});

/**
 * EN: Get web client WebRTC status
 * FR: Récupérer le statut WebRTC client web
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getWebClientWebRTCStatus = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new WebRTCVerificationService();
    const webClientStatus = await verificationService.testWebClientWebRTC();

    res.status(200).json({
      success: true,
      message: 'Web client WebRTC status retrieved successfully',
      webClient: webClientStatus
    });
  } catch (error) {
    next(new Errors(`Failed to get web client WebRTC status: ${error.message}`, 500));
  }
});

/**
 * EN: Get WebRTC performance status
 * FR: Récupérer le statut des performances WebRTC
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getWebRTCPerformanceStatus = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new WebRTCVerificationService();
    const performanceStatus = await verificationService.testWebRTCPerformance();

    res.status(200).json({
      success: true,
      message: 'WebRTC performance status retrieved successfully',
      performance: performanceStatus
    });
  } catch (error) {
    next(new Errors(`Failed to get WebRTC performance status: ${error.message}`, 500));
  }
});

/**
 * EN: Get WebRTC compatibility status
 * FR: Récupérer le statut de compatibilité WebRTC
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getWebRTCCompatibilityStatus = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new WebRTCVerificationService();
    const compatibilityStatus = await verificationService.testWebRTCCompatibility();

    res.status(200).json({
      success: true,
      message: 'WebRTC compatibility status retrieved successfully',
      compatibility: compatibilityStatus
    });
  } catch (error) {
    next(new Errors(`Failed to get WebRTC compatibility status: ${error.message}`, 500));
  }
});

/**
 * EN: Get WebRTC health summary
 * FR: Récupérer le résumé de santé WebRTC
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getWebRTCHealthSummary = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new WebRTCVerificationService();
    
    // EN: Run quick checks / FR: Exécuter des vérifications rapides
    await verificationService.testMediasoupFunctionality();
    await verificationService.testReactNativeWebRTC();
    await verificationService.testWebClientWebRTC();
    await verificationService.testWebRTCPerformance();
    await verificationService.testWebRTCCompatibility();
    verificationService.generateRecommendations();

    const summary = verificationService.getVerificationSummary();

    res.status(200).json({
      success: true,
      message: 'WebRTC health summary retrieved successfully',
      summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(new Errors(`Failed to get WebRTC health summary: ${error.message}`, 500));
  }
});

/**
 * EN: Get WebRTC codec information
 * FR: Récupérer les informations des codecs WebRTC
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getWebRTCCodecInfo = CatchAsyncError(async (req, res, next) => {
  try {
    const verificationService = new WebRTCVerificationService();
    await verificationService.initializeMediasoupWorker();

    const codecInfo = {
      audio: [
        {
          name: 'Opus',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2,
          priority: 'high',
          supported: true
        },
        {
          name: 'G.722',
          mimeType: 'audio/G722',
          clockRate: 8000,
          channels: 1,
          priority: 'medium',
          supported: true
        },
        {
          name: 'PCMU',
          mimeType: 'audio/PCMU',
          clockRate: 8000,
          channels: 1,
          priority: 'low',
          supported: true
        },
        {
          name: 'PCMA',
          mimeType: 'audio/PCMA',
          clockRate: 8000,
          channels: 1,
          priority: 'low',
          supported: true
        }
      ],
      video: [
        {
          name: 'VP8',
          mimeType: 'video/VP8',
          clockRate: 90000,
          priority: 'high',
          supported: true
        },
        {
          name: 'VP9',
          mimeType: 'video/VP9',
          clockRate: 90000,
          priority: 'high',
          supported: true
        },
        {
          name: 'H.264',
          mimeType: 'video/H264',
          clockRate: 90000,
          priority: 'medium',
          supported: true
        },
        {
          name: 'AV1',
          mimeType: 'video/AV1',
          clockRate: 90000,
          priority: 'low',
          supported: false
        }
      ]
    };

    res.status(200).json({
      success: true,
      message: 'WebRTC codec information retrieved successfully',
      codecs: codecInfo
    });
  } catch (error) {
    next(new Errors(`Failed to get WebRTC codec information: ${error.message}`, 500));
  }
});

/**
 * EN: Get WebRTC platform support
 * FR: Récupérer le support des plateformes WebRTC
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getWebRTCPlatformSupport = CatchAsyncError(async (req, res, next) => {
  try {
    const platformSupport = {
      mobile: {
        android: {
          supported: true,
          minVersion: '5.0',
          features: [
            'Audio calls',
            'Video calls',
            'Group calls',
            'Screen sharing',
            'Data channels',
            'File transfer'
          ],
          modules: [
            'react-native-webrtc',
            'mediasoup-client',
            'react-native-callkeep',
            'react-native-incoming-call'
          ]
        },
        ios: {
          supported: true,
          minVersion: '11.0',
          features: [
            'Audio calls',
            'Video calls',
            'Group calls',
            'Screen sharing',
            'Data channels',
            'File transfer'
          ],
          modules: [
            'react-native-webrtc',
            'mediasoup-client',
            'react-native-callkeep',
            'react-native-incoming-call'
          ]
        }
      },
      web: {
        chrome: {
          supported: true,
          minVersion: '56',
          features: [
            'Audio calls',
            'Video calls',
            'Group calls',
            'Screen sharing',
            'Data channels',
            'File transfer',
            'Background removal'
          ],
          modules: [
            'mediasoup-client',
            '@tensorflow/tfjs',
            '@tensorflow-models/body-pix'
          ]
        },
        firefox: {
          supported: true,
          minVersion: '52',
          features: [
            'Audio calls',
            'Video calls',
            'Group calls',
            'Screen sharing',
            'Data channels',
            'File transfer'
          ],
          modules: [
            'mediasoup-client'
          ]
        },
        safari: {
          supported: true,
          minVersion: '11',
          features: [
            'Audio calls',
            'Video calls',
            'Group calls',
            'Data channels',
            'File transfer'
          ],
          modules: [
            'mediasoup-client'
          ]
        },
        edge: {
          supported: true,
          minVersion: '79',
          features: [
            'Audio calls',
            'Video calls',
            'Group calls',
            'Screen sharing',
            'Data channels',
            'File transfer'
          ],
          modules: [
            'mediasoup-client'
          ]
        }
      }
    };

    res.status(200).json({
      success: true,
      message: 'WebRTC platform support retrieved successfully',
      platforms: platformSupport
    });
  } catch (error) {
    next(new Errors(`Failed to get WebRTC platform support: ${error.message}`, 500));
  }
});

/**
 * EN: Get WebRTC statistics
 * FR: Récupérer les statistiques WebRTC
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getWebRTCStatistics = CatchAsyncError(async (req, res, next) => {
  try {
    const stats = {
      mediasoup: {
        version: '3.x',
        status: 'active',
        workers: 1,
        routers: 1,
        transports: 0,
        producers: 0,
        consumers: 0
      },
      reactNative: {
        webrtcVersion: '1.94.2',
        mediasoupClientVersion: '3.6.36',
        callKeepVersion: '4.3.14',
        incomingCallVersion: '2.0.3'
      },
      web: {
        mediasoupClientVersion: '3.10.0',
        tensorflowVersion: '3.8.0',
        bodyPixVersion: '2.2.0'
      },
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date()
    };

    res.status(200).json({
      success: true,
      message: 'WebRTC statistics retrieved successfully',
      statistics: stats
    });
  } catch (error) {
    next(new Errors(`Failed to get WebRTC statistics: ${error.message}`, 500));
  }
});

export default {
  verifyWebRTC,
  getMediasoupStatus,
  getReactNativeWebRTCStatus,
  getWebClientWebRTCStatus,
  getWebRTCPerformanceStatus,
  getWebRTCCompatibilityStatus,
  getWebRTCHealthSummary,
  getWebRTCCodecInfo,
  getWebRTCPlatformSupport,
  getWebRTCStatistics
};
