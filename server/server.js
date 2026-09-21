import http from "http";
import app from "./app.js";
import { validateEnv, env } from "./config/env.js";
import connectDB from "./config/db.js";
import { verifyCloudinaryConnection } from "./config/cloudinary.js";
import { initializeSockets } from "./sockets/index.js";
import logger from "./utils/logger.js";

process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  logger.error(error.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Promise Rejection: ${reason}`);
  process.exit(1);
});

const startServer = async () => {
  validateEnv();

  await connectDB();

  await verifyCloudinaryConnection();

  const server = http.createServer(app);

  initializeSockets(server, env.clientUrl);

  const PORT = env.port;

  server.listen(PORT, () => {
    logger.info(
      `HubKode server running in ${env.nodeEnv} mode on port ${PORT}`,
    );
    logger.info(`Health check: http://localhost:${PORT}/api/v1/health`);
  });

  const gracefulHttpShutdown = (signal) => {
    logger.info(`${signal} received. Shutting down HTTP server...`);

    server.close(() => {
      logger.info("HTTP server closed.");
      process.exit(0);
    });

    setTimeout(() => {
      logger.error("Forced shutdown after timeout.");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGINT", () => gracefulHttpShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulHttpShutdown("SIGTERM"));
};

startServer();
