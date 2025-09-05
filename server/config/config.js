/**
 * @file config.js
 * @description
 * EN: This file contains the configuration variables for the server application.
 * FR: Ce fichier contient les variables de configuration pour l'application serveur.
 */
const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || "YOUR_secret_key",
  mongoUri:
    process.env.MONGODB_URL ||
    "mongodb://" +
      (process.env.IP || "localhost") +
      ":" +
      (process.env.MONGO_PORT || "27017") +
      "/mern_db", // EN: MongoDB connection URI / FR: URI de connexion MongoDB
  stripe_connect_test_client_id: process.env.STRIPE_CONNECT_TEST_CLIENT_ID || "YOUR_stripe_connect_test_client", // EN: Stripe Connect Test Client ID / FR: ID client de test Stripe Connect
  stripe_test_secret_key: process.env.STRIPE_TEST_SECRET_KEY || "YOUR_stripe_test_secret_key", // EN: Stripe Test Secret Key / FR: Clé secrète de test Stripe
  stripe_test_api_key: process.env.STRIPE_TEST_API_KEY || "YOUR_stripe_test_api_key", // EN: Stripe Test API Key / FR: Clé API de test Stripe
};

export default config;