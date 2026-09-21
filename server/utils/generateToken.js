import jwt from "jsonwebtoken";
import { ApiError } from "./apiResponse.js";

const generateAccessToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new ApiError(
      500,
      "JWT_SECRET is not defined in environment variables",
    );
  }

  const payload = {
    id: user._id,
    role: user.role,
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

export { generateAccessToken };
