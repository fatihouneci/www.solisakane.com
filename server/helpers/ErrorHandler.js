/**
 * @file ErrorHandler.js
 * @description
 * EN: This file defines a global error handling middleware for Express applications.
 * FR: Ce fichier définit un middleware de gestion d'erreurs global pour les applications Express.
 */
import Errors from "./Errors.js"; // EN: Custom error class / FR: Classe d'erreur personnalisée

/**
 * EN: Global error handling middleware.
 * FR: Middleware de gestion d'erreurs global.
 * @param {Error} err - The error object. / L'objet d'erreur.
 * @param {object} req - The request object. / L'objet de la requête.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {function} next - The next middleware function. / La prochaine fonction middleware.
 */
const ErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // EN: Default to 500 if no status code is provided / FR: Par défaut à 500 si aucun code de statut n'est fourni
  err.message = err.message || "Internal Server Error"; // EN: Default error message / FR: Message d'erreur par défaut

  // EN: Handle specific Mongoose errors (e.g., CastError, ValidationError, DuplicateKeyError)
  // FR: Gérer les erreurs Mongoose spécifiques (ex: CastError, ValidationError, DuplicateKeyError)
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new Errors(message, 400);
  }
  if (err.code === 11000) { // EN: Duplicate key error / FR: Erreur de clé dupliquée
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new Errors(message, 400);
  }
  if (err.name === "JsonWebTokenError") { // EN: Wrong JWT error / FR: Erreur JWT incorrecte
    const message = `Json Web Token is Invalid, Try again `;
    err = new Errors(message, 401);
  }
  if (err.name === "TokenExpiredError") { // EN: JWT Token expired error / FR: Erreur de jeton JWT expiré
    const message = `Json Web Token is Expired, Try again `;
    err = new Errors(message, 401);
  }
  // EN: Mongoose Validation Error (added based on common patterns) / FR: Erreur de validation Mongoose (ajouté basé sur des modèles courants)
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    err = new Errors(message, 400);
  }

  // EN: Send error response
  // FR: Envoyer la réponse d'erreur
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default ErrorHandler;