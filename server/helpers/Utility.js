/**
 * @file Utility.js
 * @description
 * EN: This file contains various utility functions for common tasks such as hashing, token generation, and cookie management.
 * FR: Ce fichier contient diverses fonctions utilitaires pour des tâches courantes telles que le hachage, la génération de jetons et la gestion des cookies.
 */
import jwt from "jsonwebtoken"; // EN: JSON Web Token library / FR: Bibliothèque JSON Web Token
import bcrypt from "bcryptjs"; // EN: Library for hashing passwords / FR: Bibliothèque pour le hachage des mots de passe
import crypto from "crypto"; // EN: Node.js crypto module for cryptographic functionalities / FR: Module crypto de Node.js pour les fonctionnalités cryptographiques

/**
 * EN: Returns the current timestamp.
 * FR: Retourne l'horodatage actuel.
 * @returns {number} Current timestamp. / Horodatage actuel.
 */
const getTime = () => {
  return Date.now();
};

/**
 * EN: Hashes a given password.
 * FR: Hache un mot de passe donné.
 * @param {string} password - The password to hash. / Le mot de passe à hacher.
 * @returns {string} The hashed password. / Le mot de passe haché.
 */
function hash(password) {
  return bcrypt.hashSync(password, 10);
}

/**
 * EN: Verifies an activation token.
 * FR: Vérifie un jeton d'activation.
 * @param {string} activationToken - The activation token to verify. / Le jeton d'activation à vérifier.
 * @returns {object} The decoded token payload. / La charge utile du jeton décodé.
 */
function verifyActivationToken(activationToken) {
  let verifyToken = jwt.verify(activationToken, process.env.SECRET_KEY); // EN: Uses SECRET_KEY from environment variables / FR: Utilise SECRET_KEY des variables d'environnement

  return verifyToken;
}

/**
 * EN: Generates an activation token for a user.
 * FR: Génère un jeton d'activation pour un utilisateur.
 * @param {object} user - The user object. / L'objet utilisateur.
 * @returns {object} An object containing the activation code and activation token. / Un objet contenant le code d'activation et le jeton d'activation.
 */
function generateActivationToken(user) {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString(); // EN: 4-digit code / FR: Code à 4 chiffres
  const token = jwt.sign(
    {
      email: user.email,
      activationCode,
    },
    process.env.SECRET_KEY, // EN: Uses SECRET_KEY from environment variables / FR: Utilise SECRET_KEY des variables d'environnement
    { expiresIn: "5m" } // EN: Token expires in 5 minutes / FR: Le jeton expire dans 5 minutes
  );
  return { activationCode, token };
}

/**
 * EN: Generates a random token string.
 * FR: Génère une chaîne de jeton aléatoire.
 * @returns {string} A random token string. / Une chaîne de jeton aléatoire.
 */
function randomTokenString() {
  return crypto.randomBytes(4).toString("hex").toLocaleUpperCase();
}

/**
 * EN: Sets a token cookie in the response.
 * FR: Définit un cookie de jeton dans la réponse.
 * @param {object} res - The response object. / L'objet de la réponse.
 * @param {string} token - The token to set in the cookie. / Le jeton à définir dans le cookie.
 */
function setTokenCookie(res, token) {
  // EN: Create cookie with refresh token that expires in 7 days
  // FR: Créer un cookie avec un jeton de rafraîchissement qui expire dans 7 jours
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
  res.cookie("refreshToken", token, cookieOptions);
}

export default {
  // getRefreshToken, // EN: Commented out as it's not implemented / FR: Commenté car non implémenté
  hash,
  generateActivationToken,
  verifyActivationToken,
  randomTokenString,
  setTokenCookie,
  padNumber, // EN: Function not defined in this snippet, assuming it's elsewhere or unused / FR: Fonction non définie dans cet extrait, supposée être ailleurs ou inutilisée
  getTime,
};

// EN: padNumber function (assuming it's intended to be here or imported)
// FR: Fonction padNumber (supposée être ici ou importée)
function padNumber(n, width, z) {
  z = z || "0";
  n = n + "";
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}