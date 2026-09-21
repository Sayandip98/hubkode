import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";
import logger from "../utils/logger.js";

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

const verifyCloudinaryConnection = async () => {
  try {
    await cloudinary.api.ping();
    logger.info("Cloudinary connected successfully.");
  } catch (error) {
    logger.warn(
      `Cloudinary connection failed: ${error.message}. Media uploads will be unavailable.`,
    );
  }
};

export { cloudinary, verifyCloudinaryConnection };
