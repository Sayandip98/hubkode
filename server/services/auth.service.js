import User from "../models/User.js";
import { ApiError } from "../utils/apiResponse.js";
import { generateAccessToken } from "../utils/generateToken.js";

const registerUser = async ({ username, email, password, displayName }) => {
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    if (existingUser.username === username) {
      throw new ApiError(409, `Username "${username}" is already taken`);
    }
    throw new ApiError(409, `Email "${email}" is already registered`);
  }

  const user = await User.create({
    username,
    email,
    password,
    displayName: displayName || username,
  });

  const token = generateAccessToken(user);

  const safeUser = await User.findById(user._id);

  return { user: safeUser, token };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(
      401,
      "Your account has been deactivated. Please contact support.",
    );
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateAccessToken(user);

  const safeUser = await User.findById(user._id);

  return { user: safeUser, token };
};

const getAuthenticatedUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

const changePassword = async ({ userId, currentPassword, newPassword }) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordCorrect) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  return { message: "Password changed successfully" };
};

export { registerUser, loginUser, getAuthenticatedUser, changePassword };
