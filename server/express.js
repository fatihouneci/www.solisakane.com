
/**
 * @file express.js
 * @description
 * EN: This file configures the Express application with various middleware and routes.
 * FR: Ce fichier configure l'application Express avec divers middlewares et routes.
 */
import express from 'express';
import bodyParser from 'body-parser'; // EN: Deprecated, but used in existing code. Consider replacing with express.json() and express.urlencoded() / FR: Déprécié, mais utilisé dans le code existant. Envisager de le remplacer par express.json() et express.urlencoded()
import cookieParser from 'cookie-parser';
import compress from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import ErrorHandler from './helpers/ErrorHandler.js'; // EN: Custom error handling middleware / FR: Middleware de gestion d'erreurs personnalisé

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import fileRoutes from './routes/file.routes.js';
import chatRoutes from './routes/chat.routes.js';
import messageRoutes from './routes/message.routes.js';
import callRoutes from './routes/call.routes.js';
import mediaRoutes from './routes/media.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import supportRoutes from './routes/support.routes.js';
import callRecordingRoutes from './routes/callRecording.routes.js';
import statusRoutes from './routes/status.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import meetingRoutes from './routes/meeting.routes.js';
import searchRoutes from './routes/search.routes.js';
import networkRoutes from './routes/network.routes.js';
import databaseRoutes from './routes/database.routes.js';
import socketRoutes from './routes/socket.routes.js';
import webrtcRoutes from './routes/webrtc.routes.js';
import e2eTestRoutes from './routes/e2eTest.routes.js';
import stabilityVerificationRoutes from './routes/stabilityVerification.routes.js';

const app = express();

// EN: Parse body params and attach them to req.body
// FR: Analyser les paramètres du corps de la requête et les attacher à req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compress());
// EN: Secure apps by setting various HTTP headers
// FR: Sécuriser les applications en définissant divers en-têtes HTTP
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // EN: Specific Helmet policy for cross-origin resources / FR: Politique Helmet spécifique pour les ressources cross-origin
// EN: Enable CORS - Cross Origin Resource Sharing
// FR: Activer CORS - Partage de ressources entre origines
app.use(cors());

// EN: Serve static files from the 'uploads' directory
// FR: Servir les fichiers statiques depuis le répertoire 'uploads'
app.use("/", express.static(path.join(__dirname, "uploads")));

// EN: Mount API routes
// FR: Monter les routes API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/recordings", callRecordingRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/network", networkRoutes);
app.use("/api/database", databaseRoutes);
app.use("/api/socket", socketRoutes);
app.use("/api/webrtc", webrtcRoutes);
app.use("/api/e2e", e2eTestRoutes);
app.use("/api/stability", stabilityVerificationRoutes);

// EN: Catch unauthorised errors and handle them
// FR: Attraper les erreurs non autorisées et les gérer
app.use(ErrorHandler);

export default app;
