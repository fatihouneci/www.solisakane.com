/**
 * @file shop.model.js
 * @description
 * EN: This file defines the Mongoose schema and model for a Shop.
 * FR: Ce fichier définit le schéma et le modèle Mongoose pour une Boutique.
 */
import mongoose from 'mongoose'; // EN: Mongoose library / FR: Bibliothèque Mongoose

const ShopSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'EN: Name is required / FR: Le nom est requis'
  },
  image: { // EN: Shop image data / FR: Données de l'image de la boutique
    data: Buffer, // EN: Binary image data / FR: Données binaires de l'image
    contentType: String, // EN: Content type of the image (e.g., 'image/jpeg') / FR: Type de contenu de l'image (ex: 'image/jpeg')
  },
  description: {
    type: String,
    trim: true
  },
  updated: Date, // EN: Timestamp for last update / FR: Horodatage de la dernière mise à jour
  created: { // EN: Timestamp for creation / FR: Horodatage de la création
    type: Date,
    default: Date.now,
  },
  owner: { // EN: Reference to the User who owns the shop / FR: Référence à l'utilisateur propriétaire de la boutique
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  // EN: The 'category' field was in my draft but not in the original file.
  // FR: Le champ 'category' était dans mon brouillon mais pas dans le fichier original.
  // category: {
  //   type: String,
  //   required: 'EN: Category is required / FR: La catégorie est requise'
  // }
}); // EN: No 'timestamps: true' in original, using explicit 'created' and 'updated' fields / FR: Pas de 'timestamps: true' dans l'original, utilisant les champs 'created' et 'updated' explicites

export default mongoose.model('Shop', ShopSchema);