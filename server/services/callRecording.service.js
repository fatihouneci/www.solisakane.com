/**
 * @file callRecording.service.js
 * @description
 * EN: This service handles call recording functionality including recording management, storage, and playback.
 * FR: Ce service gère la fonctionnalité d'enregistrement d'appels incluant la gestion, le stockage et la lecture des enregistrements.
 */
import Call from "../models/call.model.js";
import File from "../models/file.model.js";
import User from "../models/user.model.js";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import logger from '../helpers/logger.js';

/**
 * EN: CallRecordingService Class.
 * Manages call recording functionality including recording creation, storage, encryption, and retrieval.
 * FR: Classe CallRecordingService.
 * Gère la fonctionnalité d'enregistrement d'appels incluant la création, le stockage, le chiffrement et la récupération des enregistrements.
 */
class CallRecordingService {
  constructor() {
    this.recordingsPath = path.join(process.cwd(), 'uploads', 'recordings');
    this.ensureRecordingsDirectory();
  }

  /**
   * EN: Ensure recordings directory exists
   * FR: S'assurer que le répertoire d'enregistrements existe
   */
  ensureRecordingsDirectory() {
    if (!fs.existsSync(this.recordingsPath)) {
      fs.mkdirSync(this.recordingsPath, { recursive: true });
      logger.info('EN: Created recordings directory / FR: Répertoire d\'enregistrements créé');
    }
  }

  /**
   * EN: Start recording a call
   * FR: Commencer l'enregistrement d'un appel
   * @param {string} callId - The call ID / L'ID de l'appel
   * @param {object} recordingOptions - Recording options / Options d'enregistrement
   * @returns {Promise<object>} Recording information / Informations d'enregistrement
   */
  async startRecording(callId, recordingOptions = {}) {
    try {
      const call = await Call.findOne({ callId });
      if (!call) {
        throw new Error('Call not found');
      }

      // EN: Check if recording is already in progress / FR: Vérifier si un enregistrement est déjà en cours
      const activeRecording = call.recordings.find(rec => !rec.metadata.endTime);
      if (activeRecording) {
        throw new Error('Recording already in progress for this call');
      }

      // EN: Check recording settings / FR: Vérifier les paramètres d'enregistrement
      if (!call.recordingSettings.enabled) {
        throw new Error('Recording is not enabled for this call');
      }

      // EN: Generate recording ID and filename / FR: Générer l'ID d'enregistrement et le nom de fichier
      const recordingId = uuidv4();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const format = recordingOptions.format || call.recordingSettings.format || 'webm';
      const filename = `call_${callId}_${timestamp}.${format}`;
      const filePath = path.join(this.recordingsPath, filename);

      // EN: Create recording object / FR: Créer l'objet d'enregistrement
      const recording = {
        recordingId,
        url: `/recordings/${filename}`,
        filename,
        duration: 0,
        size: 0,
        format,
        quality: recordingOptions.quality || call.recordingSettings.quality || 'medium',
        isEncrypted: recordingOptions.isEncrypted || false,
        encryptionKey: recordingOptions.isEncrypted ? this.generateEncryptionKey() : null,
        participants: recordingOptions.participants || [],
        metadata: {
          startTime: new Date(),
          endTime: null,
          recordingType: recordingOptions.recordingType || 'audio',
          resolution: recordingOptions.resolution || null,
          bitrate: recordingOptions.bitrate || null,
          sampleRate: recordingOptions.sampleRate || null,
          channels: recordingOptions.channels || null
        },
        permissions: {
          canDownload: recordingOptions.canDownload !== false,
          canShare: recordingOptions.canShare || false,
          canDelete: recordingOptions.canDelete !== false,
          expiresAt: recordingOptions.expiresAt || null
        },
        downloadCount: 0,
        lastAccessed: new Date(),
        isDeleted: false,
        createdAt: new Date()
      };

      // EN: Add recording to call / FR: Ajouter l'enregistrement à l'appel
      call.recordings.push(recording);
      await call.save();

      logger.info(`EN: Started recording for call ${callId} / FR: Enregistrement démarré pour l'appel ${callId}`);

      return {
        success: true,
        recordingId,
        filename,
        filePath,
        recording
      };
    } catch (error) {
      logger.error(`EN: Error starting recording: ${error.message} / FR: Erreur de démarrage d'enregistrement : ${error.message}`);
      throw error;
    }
  }

  /**
   * EN: Stop recording a call
   * FR: Arrêter l'enregistrement d'un appel
   * @param {string} callId - The call ID / L'ID de l'appel
   * @param {string} recordingId - The recording ID / L'ID de l'enregistrement
   * @param {object} finalData - Final recording data / Données finales d'enregistrement
   * @returns {Promise<object>} Updated recording information / Informations d'enregistrement mises à jour
   */
  async stopRecording(callId, recordingId, finalData = {}) {
    try {
      const call = await Call.findOne({ callId });
      if (!call) {
        throw new Error('Call not found');
      }

      // EN: Find the recording / FR: Trouver l'enregistrement
      const recording = call.recordings.find(rec => rec.recordingId === recordingId);
      if (!recording) {
        throw new Error('Recording not found');
      }

      // EN: Update recording with final data / FR: Mettre à jour l'enregistrement avec les données finales
      recording.metadata.endTime = new Date();
      recording.duration = finalData.duration || this.calculateDuration(recording.metadata.startTime, recording.metadata.endTime);
      recording.size = finalData.size || 0;
      
      if (finalData.participants) {
        recording.participants = finalData.participants;
      }

      // EN: Update metadata / FR: Mettre à jour les métadonnées
      if (finalData.bitrate) recording.metadata.bitrate = finalData.bitrate;
      if (finalData.sampleRate) recording.metadata.sampleRate = finalData.sampleRate;
      if (finalData.channels) recording.metadata.channels = finalData.channels;
      if (finalData.resolution) recording.metadata.resolution = finalData.resolution;

      await call.save();

      logger.info(`EN: Stopped recording for call ${callId} / FR: Enregistrement arrêté pour l'appel ${callId}`);

      return {
        success: true,
        recording
      };
    } catch (error) {
      logger.error(`EN: Error stopping recording: ${error.message} / FR: Erreur d'arrêt d'enregistrement : ${error.message}`);
      throw error;
    }
  }

  /**
   * EN: Get call recordings
   * FR: Récupérer les enregistrements d'appel
   * @param {string} callId - The call ID / L'ID de l'appel
   * @param {string} userId - The user ID requesting recordings / L'ID utilisateur demandant les enregistrements
   * @returns {Promise<object>} Call recordings / Enregistrements d'appel
   */
  async getCallRecordings(callId, userId) {
    try {
      const call = await Call.findOne({ callId }).populate('callerId', 'firstName lastName');
      if (!call) {
        throw new Error('Call not found');
      }

      // EN: Check if user has access to this call / FR: Vérifier si l'utilisateur a accès à cet appel
      const hasAccess = call.callerId._id.toString() === userId || 
                       call.recordings.some(rec => 
                         rec.participants.some(p => p.userId.toString() === userId)
                       );

      if (!hasAccess) {
        throw new Error('Access denied to call recordings');
      }

      // EN: Filter out deleted recordings / FR: Filtrer les enregistrements supprimés
      const activeRecordings = call.recordings.filter(rec => !rec.isDeleted);

      return {
        success: true,
        callId,
        recordings: activeRecordings,
        totalRecordings: activeRecordings.length
      };
    } catch (error) {
      logger.error(`EN: Error getting call recordings: ${error.message} / FR: Erreur de récupération des enregistrements : ${error.message}`);
      throw error;
    }
  }

  /**
   * EN: Download a recording
   * FR: Télécharger un enregistrement
   * @param {string} callId - The call ID / L'ID de l'appel
   * @param {string} recordingId - The recording ID / L'ID de l'enregistrement
   * @param {string} userId - The user ID requesting download / L'ID utilisateur demandant le téléchargement
   * @returns {Promise<object>} Download information / Informations de téléchargement
   */
  async downloadRecording(callId, recordingId, userId) {
    try {
      const call = await Call.findOne({ callId });
      if (!call) {
        throw new Error('Call not found');
      }

      const recording = call.recordings.find(rec => rec.recordingId === recordingId);
      if (!recording) {
        throw new Error('Recording not found');
      }

      // EN: Check permissions / FR: Vérifier les permissions
      if (!recording.permissions.canDownload) {
        throw new Error('Download not allowed for this recording');
      }

      // EN: Check if recording has expired / FR: Vérifier si l'enregistrement a expiré
      if (recording.permissions.expiresAt && new Date() > recording.permissions.expiresAt) {
        throw new Error('Recording has expired');
      }

      // EN: Check access / FR: Vérifier l'accès
      const hasAccess = call.callerId.toString() === userId || 
                       recording.participants.some(p => p.userId.toString() === userId);

      if (!hasAccess) {
        throw new Error('Access denied to this recording');
      }

      // EN: Update download count and last accessed / FR: Mettre à jour le compteur de téléchargement et la dernière fois accédé
      recording.downloadCount += 1;
      recording.lastAccessed = new Date();
      await call.save();

      const filePath = path.join(this.recordingsPath, recording.filename);

      return {
        success: true,
        filePath,
        filename: recording.filename,
        recording
      };
    } catch (error) {
      logger.error(`EN: Error downloading recording: ${error.message} / FR: Erreur de téléchargement d'enregistrement : ${error.message}`);
      throw error;
    }
  }

  /**
   * EN: Delete a recording
   * FR: Supprimer un enregistrement
   * @param {string} callId - The call ID / L'ID de l'appel
   * @param {string} recordingId - The recording ID / L'ID de l'enregistrement
   * @param {string} userId - The user ID requesting deletion / L'ID utilisateur demandant la suppression
   * @returns {Promise<object>} Deletion result / Résultat de suppression
   */
  async deleteRecording(callId, recordingId, userId) {
    try {
      const call = await Call.findOne({ callId });
      if (!call) {
        throw new Error('Call not found');
      }

      const recording = call.recordings.find(rec => rec.recordingId === recordingId);
      if (!recording) {
        throw new Error('Recording not found');
      }

      // EN: Check permissions / FR: Vérifier les permissions
      if (!recording.permissions.canDelete) {
        throw new Error('Deletion not allowed for this recording');
      }

      // EN: Check if user is the caller or has admin rights / FR: Vérifier si l'utilisateur est l'appelant ou a des droits admin
      const isCaller = call.callerId.toString() === userId;
      if (!isCaller) {
        throw new Error('Only the caller can delete recordings');
      }

      // EN: Soft delete the recording / FR: Suppression logique de l'enregistrement
      recording.isDeleted = true;
      await call.save();

      // EN: Optionally delete the physical file / FR: Optionnellement supprimer le fichier physique
      const filePath = path.join(this.recordingsPath, recording.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      logger.info(`EN: Deleted recording ${recordingId} for call ${callId} / FR: Enregistrement ${recordingId} supprimé pour l'appel ${callId}`);

      return {
        success: true,
        message: 'Recording deleted successfully'
      };
    } catch (error) {
      logger.error(`EN: Error deleting recording: ${error.message} / FR: Erreur de suppression d'enregistrement : ${error.message}`);
      throw error;
    }
  }

  /**
   * EN: Update recording settings for a call
   * FR: Mettre à jour les paramètres d'enregistrement pour un appel
   * @param {string} callId - The call ID / L'ID de l'appel
   * @param {object} settings - Recording settings / Paramètres d'enregistrement
   * @param {string} userId - The user ID / L'ID utilisateur
   * @returns {Promise<object>} Updated settings / Paramètres mis à jour
   */
  async updateRecordingSettings(callId, settings, userId) {
    try {
      const call = await Call.findOne({ callId });
      if (!call) {
        throw new Error('Call not found');
      }

      // EN: Check if user is the caller / FR: Vérifier si l'utilisateur est l'appelant
      if (call.callerId.toString() !== userId) {
        throw new Error('Only the caller can update recording settings');
      }

      // EN: Update recording settings / FR: Mettre à jour les paramètres d'enregistrement
      call.recordingSettings = {
        ...call.recordingSettings,
        ...settings
      };

      await call.save();

      return {
        success: true,
        recordingSettings: call.recordingSettings
      };
    } catch (error) {
      logger.error(`EN: Error updating recording settings: ${error.message} / FR: Erreur de mise à jour des paramètres d'enregistrement : ${error.message}`);
      throw error;
    }
  }

  /**
   * EN: Generate encryption key for recording
   * FR: Générer une clé de chiffrement pour l'enregistrement
   * @returns {string} Encryption key / Clé de chiffrement
   */
  generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * EN: Calculate duration between two timestamps
   * FR: Calculer la durée entre deux horodatages
   * @param {Date} startTime - Start time / Heure de début
   * @param {Date} endTime - End time / Heure de fin
   * @returns {number} Duration in seconds / Durée en secondes
   */
  calculateDuration(startTime, endTime) {
    return Math.round((endTime - startTime) / 1000);
  }

  /**
   * EN: Get recording statistics for a user
   * FR: Récupérer les statistiques d'enregistrement pour un utilisateur
   * @param {string} userId - The user ID / L'ID utilisateur
   * @param {number} period - Period in days / Période en jours
   * @returns {Promise<object>} Recording statistics / Statistiques d'enregistrement
   */
  async getRecordingStats(userId, period = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      const calls = await Call.find({
        $or: [
          { callerId: userId },
          { 'recordings.participants.userId': userId }
        ],
        createdAt: { $gte: startDate }
      });

      let totalRecordings = 0;
      let totalDuration = 0;
      let totalSize = 0;
      const recordingsByType = {};

      calls.forEach(call => {
        call.recordings.forEach(recording => {
          if (!recording.isDeleted) {
            totalRecordings++;
            totalDuration += recording.duration;
            totalSize += recording.size;
            
            const type = recording.metadata.recordingType;
            recordingsByType[type] = (recordingsByType[type] || 0) + 1;
          }
        });
      });

      return {
        success: true,
        stats: {
          totalRecordings,
          totalDuration,
          totalSize,
          averageDuration: totalRecordings > 0 ? Math.round(totalDuration / totalRecordings) : 0,
          recordingsByType,
          period
        }
      };
    } catch (error) {
      logger.error(`EN: Error getting recording stats: ${error.message} / FR: Erreur de récupération des statistiques d'enregistrement : ${error.message}`);
      throw error;
    }
  }
}

export default new CallRecordingService();
