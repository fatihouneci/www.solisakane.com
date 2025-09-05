/**
 * @file product.model.js
 * @description
 * EN: This file defines the Mongoose schema and model for a Product.
 * FR: Ce fichier définit le schéma et le modèle Mongoose pour un Produit.
 */
import mongoose from 'mongoose'; // EN: Mongoose library / FR: Bibliothèque Mongoose

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'EN: Name is required / FR: Le nom est requis'
  },
  image: {
    data: Buffer,
    contentType: String,
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true,
    required: 'EN: Category is required / FR: La catégorie est requise'
  },
  quantity: {
    type: Number,
    required: 'EN: Quantity is required / FR: La quantité est requise'
  },
  price: {
    type: Number,
    required: 'EN: Price is required / FR: Le prix est requis'
  },
  shop: { // EN: Reference to the Shop that sells this product / FR: Référence à la Boutique qui vend ce produit
    type: mongoose.Schema.ObjectId,
    ref: 'Shop'
  },
  updated: Date, // EN: Timestamp for last update / FR: Horodatage de la dernière mise à jour
  created: { // EN: Timestamp for creation / FR: Horodatage de la création
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Product', ProductSchema);