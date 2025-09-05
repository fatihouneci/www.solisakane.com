
/**
 * @file chat.model.js
 * @description
 * EN: This file defines the Mongoose schema and model for a Chat conversation.
 * FR: Ce fichier définit le schéma et le modèle Mongoose pour une conversation de Chat.
 */
import mongoose from 'mongoose'; // EN: Mongoose library / FR: Bibliothèque Mongoose
const Schema = mongoose.Schema; // EN: Alias for mongoose.Schema / FR: Alias pour mongoose.Schema

const ChatSchema = new Schema(
  {
    image: { // EN: Reference to a File (image) associated with the chat (e.g., group chat icon) / FR: Référence à un Fichier (image) associé au chat (ex: icône de chat de groupe)
      type: Schema.Types.ObjectId,
      ref: "File"
    },
    chatName: { // EN: Name of the chat (for group chats) / FR: Nom du chat (pour les chats de groupe)
      type: String
    },
    isGroupChat: { // EN: Flag to indicate if it's a group chat / FR: Indicateur pour savoir si c'est un chat de groupe
      type: Boolean,
      default: false
    },
    users: [{ // EN: Array of User IDs participating in the chat / FR: Tableau des ID d'utilisateurs participant au chat
      type: Schema.Types.ObjectId,
      ref: "User"
    }],
    owner: { // EN: Reference to the User who owns the group chat / FR: Référence à l'utilisateur propriétaire du chat de groupe
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    lastMessage: { // EN: Reference to the last message in the chat / FR: Référence au dernier message du chat
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastTimeMessageRead: { // EN: Timestamp of when the last message was read / FR: Horodatage de la dernière lecture du message
      type: Date,
      default: Date.now()
    },
    ongoingCall: { // EN: Details about an ongoing call in this chat / FR: Détails d'un appel en cours dans ce chat
      callId: mongoose.Schema.Types.ObjectId,
      chatId: mongoose.Schema.Types.ObjectId,
      callerId: mongoose.Schema.Types.ObjectId,
      cameraStatus: Boolean,
      microphoneStatus: Boolean,
      startedAt: Date,
    },
  },
  { timestamps: true } // EN: Adds createdAt and updatedAt timestamps / FR: Ajoute les horodatages createdAt et updatedAt
);

const Chat = mongoose.model("Chat", ChatSchema); // EN: Create the Chat model / FR: Créer le modèle Chat
export default Chat;
