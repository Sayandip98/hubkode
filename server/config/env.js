import dotenv from "dotenv";
import logger from "../utils/logger.js";
dotenv.config();

const REQUIRED_ENV_VARS = [
  "PORT",
  "NODE_ENV",
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "CLIENT_URL",
];

const OPTIONAL_ENV_VARS = ["ANTHROPIC_API_KEY"];

const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    missing.forEach((key) => {
      logger.error(`Missing required environment variable: ${key}`);
    });

    logger.error(
      "Application startup aborted. Please define all required environment variables.",
    );
    process.exit(1);
  }

  logger.info("Environment variables validated successfully.");
};

const env = {
  port: process.env.PORT || "5000",
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || null,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};

export { validateEnv, env };
