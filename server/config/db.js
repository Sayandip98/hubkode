import mongoose from "mongoose";
import { env } from "./env.js";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(env.mongoUri);
    logger.info(
      `MongoDB connected: ${connection.connection.host} — database: ${connection.connection.name}`,
    );
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconnected successfully.");
});

mongoose.connection.on("error", (error) => {
  logger.error(`MongoDB runtime error: ${error.message}`);
});

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Closing MongoDB connection...`);
  await mongoose.connection.close();
  logger.info("MongoDB connection closed. Process exiting.");
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

export default connectDB;
