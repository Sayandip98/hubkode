import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiResponse.js";
import logger from "../utils/logger.js";

const errorMiddleware = (err, req, res, next) => {
  logger.error({
    message: err.message,
    statusCode: err.statusCode || 500,
    method: req.method,
    url: req.originalUrl,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((field) => ({
      field: field.path,
      message: field.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: `Invalid value for field: ${err.path}`,
      errors: [],
    });
  }

  if (err.code === 11000) {
    const duplicatedField = Object.keys(err.keyValue || {})[0];
    const duplicatedValue = err.keyValue?.[duplicatedField];

    return res.status(409).json({
      success: false,
      message: `${duplicatedField} "${duplicatedValue}" is already taken`,
      errors: [],
    });
  }

  if (err instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({
      success: false,
      message: "Invalid token. Please log in again.",
      errors: [],
    });
  }

  if (err instanceof jwt.TokenExpiredError) {
    return res.status(401).json({
      success: false,
      message: "Your session has expired. Please log in again.",
      errors: [],
    });
  }

  const isDevelopment = process.env.NODE_ENV === "development";

  return res.status(500).json({
    success: false,
    message: isDevelopment
      ? err.message
      : "An unexpected error occurred. Please try again later.",
    errors: isDevelopment && err.stack ? [{ stack: err.stack }] : [],
  });
};

export default errorMiddleware;
