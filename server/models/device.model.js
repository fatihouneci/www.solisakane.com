
/**
 * @file device.model.js
 * @description
 * EN: This file defines the Mongoose schema and model for a Device.
 * It stores information about user devices for push notifications.
 * FR: Ce fichier définit le schéma et le modèle Mongoose pour un Appareil.
 * Il stocke des informations sur les appareils des utilisateurs pour les notifications push.
 */
import mongoose from 'mongoose'; // EN: Mongoose library / FR: Bibliothèque Mongoose

const DeviceSchema = new mongoose.Schema({
  userId: { // EN: Reference to the User who owns this device / FR: Référence à l'utilisateur propriétaire de cet appareil
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // EN: Index for faster queries / FR: Index pour des requêtes plus rapides
  },
  deviceId: { // EN: Unique identifier for the device / FR: Identifiant unique de l'appareil
    type: String,
    required: true,
    index: true // EN: Index for faster queries / FR: Index pour des requêtes plus rapides
  },
  deviceToken: { // EN: Push notification token (e.g., FCM token) / FR: Jeton de notification push (ex: jeton FCM)
    type: String,
    required: true
  },
  platform: { // EN: Device platform (e.g., 'android', 'ios') / FR: Plateforme de l'appareil (ex: 'android', 'ios')
    type: String,
    enum: ['ios', 'android'], // EN: Restrict to 'ios' or 'android' / FR: Restreindre à 'ios' ou 'android'
    required: true
  },
  deviceModel: { // EN: Model of the device / FR: Modèle de l'appareil
    type: String
  },
  systemVersion: { // EN: Operating system version / FR: Version du système d'exploitation
    type: String
  },
  appVersion: { // EN: Application version / FR: Version de l'application
    type: String
  },
  isValid: { // EN: Flag to indicate if the device token is still valid / FR: Indicateur pour savoir si le jeton de l'appareil est toujours valide
    type: Boolean,
    default: true
  },
  lastSeen: { // EN: Timestamp of last activity / FR: Horodatage de la dernière activité
    type: Date,
    default: Date.now
  }
}, { timestamps: true }); // EN: Adds createdAt and updatedAt timestamps / FR: Ajoute les horodatages createdAt et updatedAt

// EN: Create a compound unique index on userId and deviceId to ensure uniqueness per user per device
// FR: Créer un index unique composé sur userId et deviceId pour assurer l'unicité par utilisateur et par appareil
DeviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

export default mongoose.model('Device', DeviceSchema);
