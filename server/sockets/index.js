import { Server } from "socket.io";
import logger from "../utils/logger.js";
import { registerNotificationSocket } from "./notification.socket.js";
import { registerRepositorySocket } from "./repository.socket.js";

let io = null;

const initializeSockets = (httpServer, clientUrl) => {
  io = new Server(httpServer, {
    cors: {
      origin: clientUrl,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    registerNotificationSocket(io, socket);
    registerRepositorySocket(io, socket);

    socket.on("disconnect", (reason) => {
      logger.info(`Socket disconnected: ${socket.id} — reason: ${reason}`);
    });

    socket.on("error", (error) => {
      logger.error(`Socket error on ${socket.id}: ${error.message}`);
    });
  });

  logger.info("Socket.IO initialized successfully");

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized. Call initializeSockets first.",
    );
  }
  return io;
};

export { initializeSockets, getIO };
