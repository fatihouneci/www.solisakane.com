/**
 * @file Errors.js
 * @description
 * EN: This file defines a custom Error class for handling API errors with a specific status code.
 * FR: Ce fichier définit une classe d'erreur personnalisée pour gérer les erreurs d'API avec un code de statut spécifique.
 */
class Errors extends Error {
  /**
   * EN: Creates an instance of the Errors class.
   * FR: Crée une instance de la classe Errors.
   * @param {string} message - The error message. / Le message d'erreur.
   * @param {number} statusCode - The HTTP status code for the error. / Le code de statut HTTP pour l'erreur.
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // EN: Determine status based on status code / FR: Déterminer le statut en fonction du code de statut
    this.isOperational = true; // EN: Mark as operational error / FR: Marquer comme erreur opérationnelle

    Error.captureStackTrace(this, this.constructor); // EN: Capture stack trace / FR: Capturer la trace de la pile
  }
}

export default Errors;