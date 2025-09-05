/**
 * @file networkService.js
 * @description
 * EN: This file contains the network service for managing technical operations.
 * FR: Ce fichier contient le service réseau pour gérer les opérations techniques.
 */
import Network from "../models/network.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { v4 as uuidv4 } from 'uuid';

class NetworkService {
  /**
   * EN: Initialize network service
   * FR: Initialiser le service réseau
   */
  constructor() {
    this.syncInterval = null;
    this.backupInterval = null;
    this.startPeriodicTasks();
  }

  /**
   * EN: Start periodic tasks for sync and backup
   * FR: Démarrer les tâches périodiques pour la sync et la sauvegarde
   */
  startPeriodicTasks() {
    // EN: Check for devices needing sync every 5 minutes / FR: Vérifier les appareils nécessitant une sync toutes les 5 minutes
    this.syncInterval = setInterval(async () => {
      await this.processPendingSync();
    }, 5 * 60 * 1000);

    // EN: Check for devices needing backup every hour / FR: Vérifier les appareils nécessitant une sauvegarde toutes les heures
    this.backupInterval = setInterval(async () => {
      await this.processScheduledBackups();
    }, 60 * 60 * 1000);
  }

  /**
   * EN: Stop periodic tasks
   * FR: Arrêter les tâches périodiques
   */
  stopPeriodicTasks() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
  }

  /**
   * EN: Process pending sync operations
   * FR: Traiter les opérations de sync en attente
   */
  async processPendingSync() {
    try {
      const devicesNeedingSync = await Network.getDevicesNeedingSync(5);
      
      for (const device of devicesNeedingSync) {
        await this.syncDevice(device);
      }
    } catch (error) {
      console.error('EN: Error processing pending sync / FR: Erreur de traitement de la sync en attente:', error);
    }
  }

  /**
   * EN: Sync a specific device
   * FR: Synchroniser un appareil spécifique
   */
  async syncDevice(device) {
    try {
      const pendingItems = device.syncStatus.pendingSync;
      
      for (const item of pendingItems) {
        try {
          await this.syncItem(item, device);
          
          // EN: Remove item from pending sync / FR: Supprimer l'élément de la sync en attente
          device.syncStatus.pendingSync = device.syncStatus.pendingSync.filter(
            pendingItem => pendingItem._id.toString() !== item._id.toString()
          );
        } catch (error) {
          // EN: Record sync error / FR: Enregistrer l'erreur de sync
          await device.recordSyncError(item.type, item.itemId, error.message);
          
          // EN: Increment retry count / FR: Incrémenter le compteur de tentatives
          item.retryCount += 1;
          
          // EN: Remove item if max retries reached / FR: Supprimer l'élément si le max de tentatives est atteint
          if (item.retryCount >= item.maxRetries) {
            device.syncStatus.pendingSync = device.syncStatus.pendingSync.filter(
              pendingItem => pendingItem._id.toString() !== item._id.toString()
            );
          }
        }
      }
      
      // EN: Update last sync time / FR: Mettre à jour l'heure de dernière sync
      device.syncStatus.lastSync = new Date();
      await device.save();
      
    } catch (error) {
      console.error('EN: Error syncing device / FR: Erreur de synchronisation de l\'appareil:', error);
    }
  }

  /**
   * EN: Sync a specific item
   * FR: Synchroniser un élément spécifique
   */
  async syncItem(item, device) {
    // EN: Here you would implement the actual sync logic based on item type / FR: Ici vous implémenteriez la logique de sync réelle selon le type d'élément
    // EN: For now, we'll just simulate the sync / FR: Pour l'instant, nous simulerons juste la sync
    
    switch (item.type) {
      case 'message':
        // EN: Sync message logic / FR: Logique de sync de message
        break;
      case 'file':
        // EN: Sync file logic / FR: Logique de sync de fichier
        break;
      case 'contact':
        // EN: Sync contact logic / FR: Logique de sync de contact
        break;
      case 'setting':
        // EN: Sync setting logic / FR: Logique de sync de paramètre
        break;
      case 'status':
        // EN: Sync status logic / FR: Logique de sync de statut
        break;
      case 'notification':
        // EN: Sync notification logic / FR: Logique de sync de notification
        break;
      default:
        throw new Error(`Unknown sync type: ${item.type}`);
    }
    
    // EN: Simulate sync delay / FR: Simuler le délai de sync
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * EN: Process scheduled backups
   * FR: Traiter les sauvegardes programmées
   */
  async processScheduledBackups() {
    try {
      const devicesNeedingBackup = await Network.getDevicesNeedingBackup();
      
      for (const device of devicesNeedingBackup) {
        await this.backupDevice(device);
      }
    } catch (error) {
      console.error('EN: Error processing scheduled backups / FR: Erreur de traitement des sauvegardes programmées:', error);
    }
  }

  /**
   * EN: Backup a specific device
   * FR: Sauvegarder un appareil spécifique
   */
  async backupDevice(device) {
    try {
      const user = await User.findById(device.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // EN: Create backup data / FR: Créer les données de sauvegarde
      const backupData = {
        userId: device.userId,
        deviceId: device.deviceId,
        timestamp: new Date(),
        backupId: uuidv4(),
        data: {
          user: {
            profile: {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              profilePicture: user.profilePicture
            },
            settings: {
              notificationSettings: user.notificationSettings,
              privacySettings: user.privacySettings,
              audioVideoSettings: user.audioVideoSettings,
              themeSettings: user.themeSettings,
              securitySettings: user.securitySettings,
              dataSettings: user.dataSettings
            }
          },
          network: {
            connectionStatus: device.connectionStatus,
            dataSavingMode: device.dataSavingMode,
            syncStatus: device.syncStatus,
            emojiSettings: device.emojiSettings
          }
        }
      };

      // EN: Here you would implement the actual backup logic / FR: Ici vous implémenteriez la logique de sauvegarde réelle
      // EN: For now, we'll just update the backup timestamp / FR: Pour l'instant, nous mettrons juste à jour l'horodatage de sauvegarde
      
      device.backupSettings.lastBackup = new Date();
      
      // EN: Calculate next backup time / FR: Calculer l'heure de prochaine sauvegarde
      const nextBackup = new Date();
      switch (device.backupSettings.frequency) {
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
      device.backupSettings.nextBackup = nextBackup;

      await device.save();

      // EN: Send backup completion notification / FR: Envoyer une notification de fin de sauvegarde
      await this.sendBackupNotification(user._id, 'success', 'Sauvegarde automatique terminée avec succès');

    } catch (error) {
      console.error('EN: Error backing up device / FR: Erreur de sauvegarde de l\'appareil:', error);
      
      // EN: Send backup error notification / FR: Envoyer une notification d'erreur de sauvegarde
      const user = await User.findById(device.userId);
      if (user) {
        await this.sendBackupNotification(user._id, 'error', `Erreur de sauvegarde: ${error.message}`);
      }
    }
  }

  /**
   * EN: Send backup notification
   * FR: Envoyer une notification de sauvegarde
   */
  async sendBackupNotification(userId, type, message) {
    try {
      const notification = new Notification({
        userId,
        type: 'backup',
        title: type === 'success' ? 'Sauvegarde Réussie' : 'Erreur de Sauvegarde',
        message,
        data: {
          priority: type === 'error' ? 'high' : 'medium',
          category: 'system'
        }
      });

      await notification.save();
    } catch (error) {
      console.error('EN: Error sending backup notification / FR: Erreur d\'envoi de notification de sauvegarde:', error);
    }
  }

  /**
   * EN: Monitor network connection
   * FR: Surveiller la connexion réseau
   */
  async monitorConnection(userId, deviceId, connectionData) {
    try {
      const device = await Network.getNetworkStatus(userId, deviceId);
      
      // EN: Update connection status / FR: Mettre à jour le statut de connexion
      await device.updateConnectionStatus(
        connectionData.isConnected,
        connectionData.connectionType,
        connectionData.signalStrength
      );

      // EN: Update bandwidth if provided / FR: Mettre à jour la bande passante si fournie
      if (connectionData.bandwidth) {
        device.connectionStatus.bandwidth = {
          ...device.connectionStatus.bandwidth,
          ...connectionData.bandwidth
        };
        await device.save();
      }

      // EN: Check if data saving mode should be enabled / FR: Vérifier si le mode d'économie de données doit être activé
      if (device.dataSavingMode.autoEnable && 
          connectionData.connectionType === 'cellular' && 
          connectionData.signalStrength < device.dataSavingMode.cellularThreshold) {
        device.dataSavingMode.enabled = true;
        await device.save();
      }

      return device;
    } catch (error) {
      console.error('EN: Error monitoring connection / FR: Erreur de surveillance de connexion:', error);
      throw error;
    }
  }

  /**
   * EN: Update data usage
   * FR: Mettre à jour l'utilisation des données
   */
  async updateDataUsage(userId, deviceId, bytes) {
    try {
      const device = await Network.getNetworkStatus(userId, deviceId);
      await device.updateDataUsage(bytes);

      // EN: Check if data limit is exceeded / FR: Vérifier si la limite de données est dépassée
      const usagePercentage = (device.dataSavingMode.dataUsage.thisMonth / device.dataSavingMode.dataUsage.limit) * 100;
      
      if (usagePercentage >= 90) {
        // EN: Send data usage warning notification / FR: Envoyer une notification d'avertissement d'utilisation de données
        await this.sendDataUsageNotification(userId, 'warning', 'Utilisation de données élevée');
      } else if (usagePercentage >= 100) {
        // EN: Send data limit exceeded notification / FR: Envoyer une notification de limite de données dépassée
        await this.sendDataUsageNotification(userId, 'error', 'Limite de données mensuelle dépassée');
      }

      return device;
    } catch (error) {
      console.error('EN: Error updating data usage / FR: Erreur de mise à jour de l\'utilisation des données:', error);
      throw error;
    }
  }

  /**
   * EN: Send data usage notification
   * FR: Envoyer une notification d'utilisation de données
   */
  async sendDataUsageNotification(userId, type, message) {
    try {
      const notification = new Notification({
        userId,
        type: 'system',
        title: 'Utilisation des Données',
        message,
        data: {
          priority: type === 'error' ? 'high' : 'medium',
          category: 'system'
        }
      });

      await notification.save();
    } catch (error) {
      console.error('EN: Error sending data usage notification / FR: Erreur d\'envoi de notification d\'utilisation de données:', error);
    }
  }

  /**
   * EN: Get network statistics
   * FR: Récupérer les statistiques réseau
   */
  async getNetworkStatistics(userId, deviceId, days = 30) {
    try {
      const device = await Network.getNetworkStatus(userId, deviceId);
      
      const stats = {
        connection: {
          totalTime: device.connectionStatus.connectionDuration || 0,
          reconnectAttempts: device.connectionStatus.reconnectAttempts,
          currentSignal: device.connectionStatus.signalStrength,
          connectionType: device.connectionStatus.connectionType,
          isConnected: device.connectionStatus.isConnected
        },
        dataUsage: {
          today: device.dataSavingMode.dataUsage.today,
          thisMonth: device.dataSavingMode.dataUsage.thisMonth,
          limit: device.dataSavingMode.dataUsage.limit,
          percentage: (device.dataSavingMode.dataUsage.thisMonth / device.dataSavingMode.dataUsage.limit) * 100
        },
        sync: {
          lastSync: device.syncStatus.lastSync,
          pendingItems: device.syncStatus.pendingSync.length,
          errorCount: device.syncStatus.syncErrors.filter(error => !error.resolved).length,
          autoSync: device.syncStatus.autoSync
        },
        backup: {
          lastBackup: device.backupSettings.lastBackup,
          nextBackup: device.backupSettings.nextBackup,
          frequency: device.backupSettings.frequency,
          enabled: device.backupSettings.enabled
        },
        emoji: {
          recentCount: device.emojiSettings.recentEmojis.length,
          favoritesCount: device.emojiSettings.favorites.length,
          enabled: device.emojiSettings.enabled
        }
      };

      return stats;
    } catch (error) {
      console.error('EN: Error getting network statistics / FR: Erreur de récupération des statistiques réseau:', error);
      throw error;
    }
  }

  /**
   * EN: Clean up old data
   * FR: Nettoyer les anciennes données
   */
  async cleanupOldData() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // EN: Clean up old sync errors / FR: Nettoyer les anciennes erreurs de sync
      const devices = await Network.find({});
      for (const device of devices) {
        device.syncStatus.syncErrors = device.syncStatus.syncErrors.filter(
          error => new Date(error.timestamp) > thirtyDaysAgo
        );
        await device.save();
      }

      console.log('EN: Old data cleanup completed / FR: Nettoyage des anciennes données terminé');
    } catch (error) {
      console.error('EN: Error cleaning up old data / FR: Erreur de nettoyage des anciennes données:', error);
    }
  }
}

// EN: Create singleton instance / FR: Créer une instance singleton
const networkService = new NetworkService();

export default networkService;
