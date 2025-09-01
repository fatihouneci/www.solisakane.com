import app from "./express.js";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import config from "./config/config.js";
import SocketHandler from "./socket/socketHandler.js";
import logger from "./helpers/logger.js";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
  transports: ['websocket', 'polling']
});

// Initialize Socket.IO handler
const socketHandler = new SocketHandler(io);

// Connection URL
mongoose.connect(
  config.mongoUri,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    logger.info("Connected to MongoDB");
  }
);

// Handle MongoDB connection errors
mongoose.connection.on('error', (error) => {
  logger.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  
  // Close MongoDB connection
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
  
  // Close HTTP server
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

httpServer.listen(config.port, (err) => {
  if (err) {
    logger.error('Server startup error:', err);
    process.exit(1);
  }
  logger.info(`Server started on PORT ${config.port}`);
  logger.info(`Socket.IO server initialized`);
});

// Export for testing
export { io, socketHandler };

// node --experimental-specifier-resolution=node index.js
