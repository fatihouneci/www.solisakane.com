/**
 * @file CatchAsyncError.js
 * @description
 * EN: This file provides a utility function to wrap asynchronous Express route handlers
 * to catch any errors and pass them to the next middleware.
 * FR: Ce fichier fournit une fonction utilitaire pour envelopper les gestionnaires de routes Express asynchrones
 * afin de capturer les erreurs et de les transmettre au prochain middleware.
 */

/**
 * EN: Wraps an asynchronous function to catch any errors and pass them to the next middleware.
 * This avoids the need for repetitive try-catch blocks in every async route handler.
 * FR: Enveloppe une fonction asynchrone pour capturer les erreurs et les transmettre au prochain middleware.
 * Cela évite le besoin de blocs try-catch répétitifs dans chaque gestionnaire de route asynchrone.
 * @param {function} func - The asynchronous function (Express route handler) to wrap. / La fonction asynchrone (gestionnaire de route Express) à envelopper.
 * @returns {function} A new function that executes the original function and catches errors. / Une nouvelle fonction qui exécute la fonction originale et capture les erreurs.
 */
const CatchAsyncError = (func) => (req, res, next) => {
  Promise.resolve(func(req, res, next)).catch(next);
};

export default CatchAsyncError;