import User from "../models/User.js";
import { ApiError } from "../utils/apiResponse.js";
import {
  getPaginationParams,
  buildPaginationMeta,
} from "../utils/pagination.js";
import { notifyUserFollowed } from "./notification.service.js";

const getUserByUsername = async (username, requesterId) => {
  const user = await User.findOne({ username, isActive: true })
    .select("-password -avatarPublicId")
    .populate("followers", "username displayName avatarUrl")
    .populate("following", "username displayName avatarUrl");

  if (!user) {
    throw new ApiError(404, `User "${username}" not found`);
  }

  const isOwnProfile =
    requesterId && user._id.toString() === requesterId.toString();

  return { user, isOwnProfile };
};

const updateUserProfile = async (userId, updates) => {
  const allowedFields = [
    "displayName",
    "bio",
    "location",
    "website",
    "company",
  ];

  const sanitizedUpdates = {};
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      sanitizedUpdates[field] = updates[field];
    }
  });

  if (Object.keys(sanitizedUpdates).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: sanitizedUpdates },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

const updateUserAvatar = async (userId, avatarUrl, avatarPublicId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { avatarUrl, avatarPublicId } },
    { new: true },
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

const followUser = async (followerId, username) => {
  const targetUser = await User.findOne({ username, isActive: true });

  if (!targetUser) {
    throw new ApiError(404, `User "${username}" not found`);
  }

  if (targetUser._id.toString() === followerId.toString()) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const alreadyFollowing = targetUser.followers.some(
    (id) => id.toString() === followerId.toString(),
  );

  if (alreadyFollowing) {
    throw new ApiError(409, `You are already following "${username}"`);
  }

  await User.findByIdAndUpdate(targetUser._id, {
    $addToSet: { followers: followerId },
  });

  await User.findByIdAndUpdate(followerId, {
    $addToSet: { following: targetUser._id },
  });

  await notifyUserFollowed({
    targetUser: { _id: targetUser._id },
    actor: followerId,
  });

  return { message: `You are now following "${username}"` };
};

const unfollowUser = async (followerId, username) => {
  const targetUser = await User.findOne({ username, isActive: true });

  if (!targetUser) {
    throw new ApiError(404, `User "${username}" not found`);
  }

  if (targetUser._id.toString() === followerId.toString()) {
    throw new ApiError(400, "You cannot unfollow yourself");
  }

  const isFollowing = targetUser.followers.some(
    (id) => id.toString() === followerId.toString(),
  );

  if (!isFollowing) {
    throw new ApiError(409, `You are not following "${username}"`);
  }

  await User.findByIdAndUpdate(targetUser._id, {
    $pull: { followers: followerId },
  });

  await User.findByIdAndUpdate(followerId, {
    $pull: { following: targetUser._id },
  });

  return { message: `You have unfollowed "${username}"` };
};

const getUserFollowers = async (username, query) => {
  const user = await User.findOne({ username, isActive: true });

  if (!user) {
    throw new ApiError(404, `User "${username}" not found`);
  }

  const { page, limit, skip } = getPaginationParams(query);
  const total = user.followers.length;

  const populatedUser = await User.findById(user._id).populate({
    path: "followers",
    select: "username displayName avatarUrl bio",
    options: { skip, limit },
  });

  const pagination = buildPaginationMeta(page, limit, total);

  return { followers: populatedUser.followers, pagination };
};

const getUserFollowing = async (username, query) => {
  const user = await User.findOne({ username, isActive: true });

  if (!user) {
    throw new ApiError(404, `User "${username}" not found`);
  }

  const { page, limit, skip } = getPaginationParams(query);
  const total = user.following.length;

  const populatedUser = await User.findById(user._id).populate({
    path: "following",
    select: "username displayName avatarUrl bio",
    options: { skip, limit },
  });

  const pagination = buildPaginationMeta(page, limit, total);

  return { following: populatedUser.following, pagination };
};

const searchUsers = async (searchQuery, query) => {
  if (!searchQuery || searchQuery.trim().length === 0) {
    throw new ApiError(400, "Search query is required");
  }

  const { page, limit, skip } = getPaginationParams(query);

  const filter = {
    isActive: true,
    $text: { $search: searchQuery },
  };

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("username displayName avatarUrl bio location")
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  const pagination = buildPaginationMeta(page, limit, total);

  return { users, pagination };
};

export {
  getUserByUsername,
  updateUserProfile,
  updateUserAvatar,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  searchUsers,
};
