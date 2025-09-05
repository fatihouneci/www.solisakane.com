
/**
 * @file message.model.js
 * @description
 * EN: This file defines the Mongoose schema and model for a Message in a chat.
 * FR: Ce fichier définit le schéma et le modèle Mongoose pour un Message dans un chat.
 */
import mongoose from 'mongoose'; // EN: Mongoose library / FR: Bibliothèque Mongoose
const Schema = mongoose.Schema; // EN: Alias for mongoose.Schema / FR: Alias pour mongoose.Schema

const MessageSchema = new Schema(
  {
    chat: { // EN: Reference to the Chat this message belongs to / FR: Référence au Chat auquel ce message appartient
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    type: { // EN: Type of message (e.g., 'text', 'image', 'audio', 'video') / FR: Type de message (ex: 'texte', 'image', 'audio', 'vidéo')
      type: String,
      default: "text"
    },
    content: { // EN: Content of the message / FR: Contenu du message
      type: String
    },
    sender: { // EN: Reference to the User who sent the message / FR: Référence à l'utilisateur qui a envoyé le message
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    likes: [{ // EN: Array of User IDs who liked this message / FR: Tableau des ID d'utilisateurs qui ont aimé ce message
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }],
    replyTo: { // EN: Reference to a message this message is replying to / FR: Référence à un message auquel ce message répond
      message: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
      user: { type: mongoose.Schema.ObjectId, ref: 'User' }
    },
    file: { // EN: Reference to a File associated with this message / FR: Référence à un Fichier associé à ce message
      type: mongoose.Schema.Types.ObjectId,
      ref: "File"
    },
  },
  { timestamps: true } // EN: Adds createdAt and updatedAt timestamps / FR: Ajoute les horodatages createdAt et updatedAt
);

const Message = mongoose.model("Message", MessageSchema); // EN: Create the Message model / FR: Créer le modèle Message
export default Message;
