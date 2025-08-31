import app from "./express.js";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import config from "./config/config.js";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// Connection URL
mongoose.connect(
  config.mongoUri,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to MongoDB");
  }
);


httpServer.listen(config.port, (err) => {
  if (err) {
    console.log(err);
  }
  console.info("Server started on PORT %s.", config.port);
});

// node --experimental-specifier-resolution=node index.js
