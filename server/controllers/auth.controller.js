import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
  registerUser,
  loginUser,
  getAuthenticatedUser,
  changePassword,
} from "../services/auth.service.js";

const register = asyncHandler(async (req, res) => {
  const { username, email, password, displayName } = req.body;

  const { user, token } = await registerUser({
    username,
    email,
    password,
    displayName,
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, { user, token }, "Account created successfully"),
    );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, token } = await loginUser({ email, password });

  res
    .status(200)
    .json(new ApiResponse(200, { user, token }, "Logged in successfully"));
});

const logout = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

const getMe = asyncHandler(async (req, res) => {
  const user = await getAuthenticatedUser(req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, { user }, "User profile fetched successfully"));
});

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const result = await changePassword({
    userId: req.user._id,
    currentPassword,
    newPassword,
  });

  res.status(200).json(new ApiResponse(200, null, result.message));
});

export { register, login, logout, getMe, updatePassword };
