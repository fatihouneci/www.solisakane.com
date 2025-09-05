/**
 * @file invitation.model.js
 * @description
 * EN: This file defines the Mongoose schema and model for an Invitation, typically for email-based invitations.
 * FR: Ce fichier définit le schéma et le modèle Mongoose pour une Invitation, généralement pour les invitations par e-mail.
 */
import mongoose from 'mongoose'; // EN: Mongoose library / FR: Bibliothèque Mongoose
import crypto from 'crypto'; // EN: Node.js crypto module for cryptographic functionalities / FR: Module crypto de Node.js pour les fonctionnalités cryptographiques
const Schema = mongoose.Schema; // EN: Alias for mongoose.Schema / FR: Alias pour mongoose.Schema

const InvitationSchema = new Schema(
  {
    email: { // EN: Recipient's email address / FR: Adresse e-mail du destinataire
      type: String,
      required: true,
      unique: true
    },
    token: { // EN: Unique invitation token / FR: Jeton d'invitation unique
      type: String,
      required: true
    },
    used: { // EN: Flag indicating if the invitation has been used / FR: Indicateur si l'invitation a été utilisée
      type: Boolean,
      default: false
    },
    expiresAt: { // EN: Expiration date of the invitation / FR: Date d'expiration de l'invitation
      type: Date,
      required: true
    },
    sender: { // EN: Reference to the User who sent the invitation / FR: Référence à l'utilisateur qui a envoyé l'invitation
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
  },
  { timestamps: true } // EN: Adds createdAt and updatedAt timestamps / FR: Ajoute les horodatages createdAt et updatedAt
);

/**
 * EN: Static method to generate a random invitation token.
 * FR: Méthode statique pour générer un jeton d'invitation aléatoire.
 * @returns {string} A random hexadecimal token string. / Une chaîne de jeton hexadécimale aléatoire.
 */
InvitationSchema.statics.generateToken = function () {
  return crypto.randomBytes(32).toString("hex");
};

const Invitation = mongoose.model("Invitation", InvitationSchema); // EN: Create the Invitation model / FR: Créer le modèle Invitation
export default Invitation;