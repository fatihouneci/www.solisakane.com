/**
 * @file order.model.js
 * @description
 * EN: This file defines the Mongoose schemas and models for CartItem and Order.
 * FR: Ce fichier définit les schémas et modèles Mongoose pour CartItem et Order.
 */
import mongoose from "mongoose"; // EN: Mongoose library / FR: Bibliothèque Mongoose

/**
 * EN: CartItem Schema. Represents an item within an order.
 * FR: Schéma CartItem. Représente un article dans une commande.
 */
const CartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product", // EN: Reference to the Product model / FR: Référence au modèle Product
  },
  quantity: Number,
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: "Shop", // EN: Reference to the Shop model / FR: Référence au modèle Shop
  },
  status: {
    type: String,
    default: "Not processed",
    enum: ["Not processed", "Processing", "Shipped", "Delivered", "Cancelled"], // EN: Possible statuses for a cart item / FR: Statuts possibles pour un article de panier
  },
});

/**
 * EN: Order Schema. Represents a customer order.
 * FR: Schéma Order. Représente une commande client.
 */
const OrderSchema = new mongoose.Schema({
  products: [CartItemSchema], // EN: Array of products in the order, using CartItemSchema / FR: Tableau des produits dans la commande, utilisant CartItemSchema
  customer_name: {
    type: String,
    trim: true,
    required: "EN: Name is required / FR: Le nom est requis",
  },
  customer_email: {
    type: String,
    trim: true,
    match: [/.+\@.+\..+/, "EN: Please fill a valid email address / FR: Veuillez saisir une adresse e-mail valide"],
    required: "EN: Email is required / FR: L'e-mail est requis",
  },
  delivery_address: {
    street: { type: String, required: "EN: Street is required / FR: La rue est requise" },
    city: { type: String, required: "EN: City is required / FR: La ville est requise" },
    state: { type: String },
    zipcode: { type: String, required: "EN: Zip Code is required / FR: Le code postal est requis" },
    country: { type: String, required: "EN: Country is required / FR: Le pays est requis" },
  },
  payment_id: {}, // EN: Payment transaction ID / FR: ID de transaction de paiement
  updated: Date, // EN: Timestamp for last update / FR: Horodatage de la dernière mise à jour
  created: {
    type: Date,
    default: Date.now, // EN: Timestamp for creation / FR: Horodatage de la création
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User", // EN: Reference to the User who placed the order / FR: Référence à l'utilisateur qui a passé la commande
  },
});

// EN: Create Mongoose models for CartItem and Order
// FR: Créer les modèles Mongoose pour CartItem et Order
const CartItem = mongoose.model("CartItem", CartItemSchema);
const Order = mongoose.model("Order", OrderSchema);

export { Order, CartItem };