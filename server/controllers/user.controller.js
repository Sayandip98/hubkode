import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse, ApiError } from "../utils/apiResponse.js";
import { deleteFromCloudinary } from "../middleware/upload.middleware.js";
import {
  getUserByUsername,
  updateUserProfile,
  updateUserAvatar,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  searchUsers,
} from "../services/user.service.js";

const getProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const requesterId = req.user?._id || null;

  const { user, isOwnProfile } = await getUserByUsername(username, requesterId);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user, isOwnProfile },
        "User profile fetched successfully",
      ),
    );
});

const updateProfile = asyncHandler(async (req, res) => {
  const { displayName, bio, location, website, company } = req.body;

  const user = await updateUserProfile(req.user._id, {
    displayName,
    bio,
    location,
    website,
    company,
  });

  res
    .status(200)
    .json(new ApiResponse(200, { user }, "Profile updated successfully"));
});

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please provide an image file");
  }

  if (req.user.avatarPublicId) {
    await deleteFromCloudinary(req.user.avatarPublicId);
  }

  const user = await updateUserAvatar(
    req.user._id,
    req.cloudinaryResult.secure_url,
    req.cloudinaryResult.public_id,
  );

  res
    .status(200)
    .json(new ApiResponse(200, { user }, "Avatar updated successfully"));
});

const follow = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const result = await followUser(req.user._id, username);

  res.status(200).json(new ApiResponse(200, null, result.message));
});

const unfollow = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const result = await unfollowUser(req.user._id, username);

  res.status(200).json(new ApiResponse(200, null, result.message));
});

const getFollowers = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const { followers, pagination } = await getUserFollowers(username, req.query);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { followers },
        "Followers fetched successfully",
        pagination,
      ),
    );
});

const getFollowing = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const { following, pagination } = await getUserFollowing(username, req.query);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { following },
        "Following fetched successfully",
        pagination,
      ),
    );
});

const search = asyncHandler(async (req, res) => {
  const { q } = req.query;

  const { users, pagination } = await searchUsers(q, req.query);

  res
    .status(200)
    .json(
      new ApiResponse(200, { users }, "Users fetched successfully", pagination),
    );
});

export {
  getProfile,
  updateProfile,
  uploadAvatar,
  follow,
  unfollow,
  getFollowers,
  getFollowing,
  search,
};
