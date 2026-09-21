import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { env } from "../config/env.js";

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required. Please log in.");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "Authentication token is missing.");
  }

  const decoded = jwt.verify(token, env.jwtSecret);

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    throw new ApiError(401, "User belonging to this token no longer exists.");
  }

  if (!user.isActive) {
    throw new ApiError(
      401,
      "Your account has been deactivated. Please contact support.",
    );
  }

  await User.findByIdAndUpdate(decoded.id, { lastSeenAt: new Date() });

  req.user = user;

  next();
});

const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id).select("-password");

    req.user = user && user.isActive ? user : null;
  } catch {
    req.user = null;
  }

  next();
});

export { protect, optionalAuth };
