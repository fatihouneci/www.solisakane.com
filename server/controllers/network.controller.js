/**
 * @file network.controller.js
 * @description
 * EN: This file contains the controller functions for network and technical operations.
 * FR: Ce fichier contient les fonctions du contrôleur pour les opérations réseau et techniques.
 */
import Network from "../models/network.model.js";
import User from "../models/user.model.js";
import Errors from "../helpers/Errors.js";
import CatchAsyncError from "../helpers/CatchAsyncError.js";

/**
 * EN: Get network status for user device
 * FR: Récupérer le statut réseau pour l'appareil utilisateur
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getNetworkStatus = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { deviceId } = req.params;

    if (!deviceId) {
      return next(new Errors("ID de l'appareil requis", 400));
    }

    const network = await Network.getNetworkStatus(userId, deviceId);

    res.status(200).json({
      success: true,
      network,
      message: "Statut réseau récupéré avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Update connection status
 * FR: Mettre à jour le statut de connexion
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const updateConnectionStatus = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { deviceId } = req.params;
    const { isConnected, connectionType, signalStrength, bandwidth } = req.body;

    if (!deviceId) {
      return next(new Errors("ID de l'appareil requis", 400));
    }

    const network = await Network.getNetworkStatus(userId, deviceId);
    await network.updateConnectionStatus(isConnected, connectionType, signalStrength);

    // EN: Update bandwidth if provided / FR: Mettre à jour la bande passante si fournie
    if (bandwidth) {
      network.connectionStatus.bandwidth = {
        ...network.connectionStatus.bandwidth,
        ...bandwidth
      };
      await network.save();
    }

    res.status(200).json({
      success: true,
      network,
      message: "Statut de connexion mis à jour avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get data saving mode settings
 * FR: Récupérer les paramètres du mode d'économie de données
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getDataSavingMode = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { deviceId } = req.params;

    if (!deviceId) {
      return next(new Errors("ID de l'appareil requis", 400));
    }

    const network = await Network.getNetworkStatus(userId, deviceId);

    res.status(200).json({
      success: true,
      dataSavingMode: network.dataSavingMode,
      message: "Paramètres d'économie de données récupérés avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Update data saving mode settings
 * FR: Mettre à jour les paramètres du mode d'économie de données
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const updateDataSavingMode = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { deviceId } = req.params;
    const { dataSavingMode } = req.body;

    if (!deviceId) {
      return next(new Errors("ID de l'appareil requis", 400));
    }

    const network = await Network.getNetworkStatus(userId, deviceId);
    
    // EN: Update data saving mode settings / FR: Mettre à jour les paramètres d'économie de données
    network.dataSavingMode = {
      ...network.dataSavingMode,
      ...dataSavingMode
    };

    await network.save();

    res.status(200).json({
      success: true,
      dataSavingMode: network.dataSavingMode,
      message: "Paramètres d'économie de données mis à jour avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Update data usage
 * FR: Mettre à jour l'utilisation des données
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const updateDataUsage = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { deviceId } = req.params;
    const { bytes } = req.body;

    if (!deviceId) {
      return next(new Errors("ID de l'appareil requis", 400));
    }

    if (!bytes || bytes < 0) {
      return next(new Errors("Nombre d'octets valide requis", 400));
    }

    const network = await Network.getNetworkStatus(userId, deviceId);
    await network.updateDataUsage(bytes);

    res.status(200).json({
      success: true,
      dataUsage: network.dataSavingMode.dataUsage,
      message: "Utilisation des données mise à jour avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get sync status
 * FR: Récupérer le statut de synchronisation
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getSyncStatus = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { deviceId } = req.params;

    if (!deviceId) {
      return next(new Errors("ID de l'appareil requis", 400));
    }

    const network = await Network.getNetworkStatus(userId, deviceId);

    res.status(200).json({
      success: true,
      syncStatus: network.syncStatus,
      message: "Statut de synchronisation récupéré avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Update sync settings
 * FR: Mettre à jour les paramètres de synchronisation
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const updateSyncSettings = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { deviceId } = req.params;
    const { syncSettings } = req.body;

    if (!deviceId) {
      return next(new Errors("ID de l'appareil requis", 400));
    }

    const network = await Network.getNetworkStatus(userId, deviceId);
    
    // EN: Update sync settings / FR: Mettre à jour les paramètres de sync
    network.syncStatus = {
      ...network.syncStatus,
      ...syncSettings
    };

    await network.save();

    res.status(200).json({
      success: true,
      syncStatus: network.syncStatus,
      message: "Paramètres de synchronisation mis à jour avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Add pending sync item
 * FR: Ajouter un élément de synchronisation en attente
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const addPendingSync = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { deviceId } = req.params;
    const { type, itemId, operation } = req.body;

    if (!deviceId) {
      return next(new Errors("ID de l'appareil requis", 400));
    }

    if (!type || !itemId || !operation) {
      return next(new Errors("Type, ID de l'élément et opération sont requis", 400));
    }

    const network = await Network.getNetworkStatus(userId, deviceId);
    await network.addPendingSync(type, itemId, operation);

    res.status(200).json({
      success: true,
      pendingSync: network.syncStatus.pendingSync,
      message: "Élément de synchronisation ajouté avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Record sync error
 * FR: Enregistrer une erreur de synchronisation
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const recordSyncError = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { deviceId } = req.params;
    const { type, itemId, error } = req.body;

    if (!deviceId) {
      return next(new Errors("ID de l'appareil requis", 400));
    }

    if (!type || !itemId || !error) {
      return next(new Errors("Type, ID de l'élément et message d'erreur sont requis", 400));
    }

    const network = await Network.getNetworkStatus(userId, deviceId);
    await network.recordSyncError(type, itemId, error);

    res.status(200).json({
      success: true,
      syncErrors: network.syncStatus.syncErrors,
      message: "Erreur de synchronisation enregistrée avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get backup settings
 * FR: Récupérer les paramètres de sauvegarde
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getBackupSettings = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { deviceId } = req.params;

    if (!deviceId) {
      return next(new Errors("ID de l'appareil requis", 400));
    }

    const network = await Network.getNetworkStatus(userId, deviceId);

    res.status(200).json({
      success: true,
      backupSettings: network.backupSettings,
      message: "Paramètres de sauvegarde récupérés avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Update backup settings
 * FR: Mettre à jour les paramètres de sauvegarde
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const updateBackupSettings = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { deviceId } = req.params;
    const { backupSettings } = req.body;

    if (!deviceId) {
      return next(new Errors("ID de l'appareil requis", 400));
    }

    const network = await Network.getNetworkStatus(userId, deviceId);
    
    // EN: Update backup settings / FR: Mettre à jour les paramètres de sauvegarde
    network.backupSettings = {
      ...network.backupSettings,
      ...backupSettings
    };

    await network.save();

    res.status(200).json({
      success: true,
      backupSettings: network.backupSettings,
      message: "Paramètres de sauvegarde mis à jour avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Trigger manual backup
 * FR: Déclencher une sauvegarde manuelle
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const triggerBackup = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { deviceId } = req.params;
    const { backupTypes } = req.body;

    if (!deviceId) {
      return next(new Errors("ID de l'appareil requis", 400));
    }

    const network = await Network.getNetworkStatus(userId, deviceId);
    
    // EN: Update last backup time / FR: Mettre à jour l'heure de dernière sauvegarde
    network.backupSettings.lastBackup = new Date();
    
    // EN: Calculate next backup time / FR: Calculer l'heure de prochaine sauvegarde
    const nextBackup = new Date();
    switch (network.backupSettings.frequency) {
      case 'daily':
        nextBackup.setDate(nextBackup.getDate() + 1);
        break;
      case 'weekly':
        nextBackup.setDate(nextBackup.getDate() + 7);
        break;
      case 'monthly':
        nextBackup.setMonth(nextBackup.getMonth() + 1);
        break;
    }
    nextBackup.setHours(2, 0, 0, 0); // EN: 2 AM / FR: 2h du matin
    network.backupSettings.nextBackup = nextBackup;

    await network.save();

    // EN: Here you would implement the actual backup logic / FR: Ici vous implémenteriez la logique de sauvegarde réelle
    // EN: For now, we'll just return success / FR: Pour l'instant, nous retournons juste le succès

    res.status(200).json({
      success: true,
      backupSettings: network.backupSettings,
      message: "Sauvegarde déclenchée avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get emoji settings
 * FR: Récupérer les paramètres d'emojis
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getEmojiSettings = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { deviceId } = req.params;

    if (!deviceId) {
      return next(new Errors("ID de l'appareil requis", 400));
    }

    const network = await Network.getNetworkStatus(userId, deviceId);

    res.status(200).json({
      success: true,
      emojiSettings: network.emojiSettings,
      message: "Paramètres d'emojis récupérés avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Update emoji settings
 * FR: Mettre à jour les paramètres d'emojis
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const updateEmojiSettings = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { deviceId } = req.params;
    const { emojiSettings } = req.body;

    if (!deviceId) {
      return next(new Errors("ID de l'appareil requis", 400));
    }

    const network = await Network.getNetworkStatus(userId, deviceId);
    
    // EN: Update emoji settings / FR: Mettre à jour les paramètres d'emojis
    network.emojiSettings = {
      ...network.emojiSettings,
      ...emojiSettings
    };

    await network.save();

    res.status(200).json({
      success: true,
      emojiSettings: network.emojiSettings,
      message: "Paramètres d'emojis mis à jour avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Add recent emoji
 * FR: Ajouter un emoji récent
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const addRecentEmoji = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { deviceId } = req.params;
    const { emoji } = req.body;

    if (!deviceId) {
      return next(new Errors("ID de l'appareil requis", 400));
    }

    if (!emoji) {
      return next(new Errors("Emoji requis", 400));
    }

    const network = await Network.getNetworkStatus(userId, deviceId);
    await network.addRecentEmoji(emoji);

    res.status(200).json({
      success: true,
      recentEmojis: network.emojiSettings.recentEmojis,
      message: "Emoji récent ajouté avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

/**
 * EN: Get network statistics
 * FR: Récupérer les statistiques réseau
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const getNetworkStats = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { deviceId } = req.params;
    const { days = 30 } = req.query;

    if (!deviceId) {
      return next(new Errors("ID de l'appareil requis", 400));
    }

    const network = await Network.getNetworkStatus(userId, deviceId);
    
    // EN: Calculate statistics / FR: Calculer les statistiques
    const stats = {
      connection: {
        totalTime: network.connectionStatus.connectionDuration || 0,
        reconnectAttempts: network.connectionStatus.reconnectAttempts,
        currentSignal: network.connectionStatus.signalStrength,
        connectionType: network.connectionStatus.connectionType
      },
      dataUsage: {
        today: network.dataSavingMode.dataUsage.today,
        thisMonth: network.dataSavingMode.dataUsage.thisMonth,
        limit: network.dataSavingMode.dataUsage.limit,
        percentage: (network.dataSavingMode.dataUsage.thisMonth / network.dataSavingMode.dataUsage.limit) * 100
      },
      sync: {
        lastSync: network.syncStatus.lastSync,
        pendingItems: network.syncStatus.pendingSync.length,
        errorCount: network.syncStatus.syncErrors.filter(error => !error.resolved).length
      },
      backup: {
        lastBackup: network.backupSettings.lastBackup,
        nextBackup: network.backupSettings.nextBackup,
        frequency: network.backupSettings.frequency
      }
    };

    res.status(200).json({
      success: true,
      stats,
      message: "Statistiques réseau récupérées avec succès"
    });
  } catch (error) {
    next(new Errors(error.message, 400));
  }
});

export default {
  getNetworkStatus,
  updateConnectionStatus,
  getDataSavingMode,
  updateDataSavingMode,
  updateDataUsage,
  getSyncStatus,
  updateSyncSettings,
  addPendingSync,
  recordSyncError,
  getBackupSettings,
  updateBackupSettings,
  triggerBackup,
  getEmojiSettings,
  updateEmojiSettings,
  addRecentEmoji,
  getNetworkStats
};
