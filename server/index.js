
/**
 * @file index.js
 * @description
 * EN: This is the main entry point for the Node.js server application.
 * It initializes the Express app, connects to the database, sets up routes, and starts the server.
 * FR: Ceci est le point d'entrée principal pour l'application serveur Node.js.
 * Il initialise l'application Express, se connecte à la base de données, configure les routes et démarre le serveur.
 */
import app from "./express.js"; // EN: Import the Express app configuration / FR: Importer la configuration de l'application Express
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import config from "./config/config.js"; // EN: Import server configuration / FR: Importer la configuration du serveur
import SocketService from "./services/socket.service.js";
import NetworkService from "./services/networkService.js"; // EN: Import Socket.IO service / FR: Importer le service Socket.IO

// EN: Create HTTP server using the Express app
// FR: Création du serveur HTTP en utilisant l'application Express
const httpServer = createServer(app);

// EN: Initialize Socket.IO server
// FR: Initialisation du serveur Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "*", // EN: Allow all origins for development (consider restricting in production) / FR: Autoriser toutes les origines pour le développement (à restreindre en production)
  },
});

// EN: Connect to MongoDB
// FR: Connexion à MongoDB
mongoose.connect(
  config.mongoUri,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("EN: Connected to MongoDB / FR: Connecté à MongoDB");
  }
);

// EN: Start the HTTP server
// FR: Démarrage du serveur HTTP
httpServer.listen(config.port, (err) => {
  if (err) {
    console.log(err);
  }
  console.info("EN: Server started on PORT %s. / FR: Serveur démarré sur le PORT %s.", config.port);
});

// EN: Initialize Socket.IO service
// FR: Initialiser le service Socket.IO
const socketService = new SocketService(io);

// EN: Initialize Network service (starts periodic tasks)
// FR: Initialiser le service Réseau (démarre les tâches périodiques)
const networkService = NetworkService;

// EN: Export io and socketService for use in other modules if needed
// FR: Exporter io et socketService pour une utilisation dans d'autres modules si nécessaire
export { io, socketService };
