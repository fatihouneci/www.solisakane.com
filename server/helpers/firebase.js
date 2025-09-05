/**
 * @file firebase.js
 * @description
 * EN: This file initializes and configures the Firebase Admin SDK for the server.
 * It's used for Firebase-related services, typically for authentication or push notifications.
 * FR: Ce fichier initialise et configure le SDK Firebase Admin pour le serveur.
 * Il est utilisé pour les services liés à Firebase, généralement pour l'authentification ou les notifications push.
 */
import admin from "firebase-admin"; // EN: Firebase Admin SDK / FR: SDK Firebase Admin
import serviceAccount from "../serviceAccountKeys.json" with { "type": "json" }; // EN: Firebase service account key / FR: Clé de compte de service Firebase

/**
 * EN: Initializes the Firebase Admin SDK.
 * FR: Initialise le SDK Firebase Admin.
 */
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;