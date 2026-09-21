import Repository from "../models/Repository.js";
import User from "../models/User.js";
import { ApiError } from "../utils/apiResponse.js";
import {
  getPaginationParams,
  buildPaginationMeta,
} from "../utils/pagination.js";
import { deleteRepositoryFromDisk } from "./git.service.js";
import { initRepository } from "./git.service.js";
import {
  notifyRepoStarred,
  notifyRepoForked,
  notifyCollaboratorAdded,
} from "./notification.service.js";

const createRepository = async ({
  name,
  description,
  isPrivate,
  hasIssues,
  hasWiki,
  website,
  topics,
  autoInit,
  owner,
}) => {
  const existingRepo = await Repository.findOne({
    owner: owner._id,
    name: { $regex: new RegExp(`^${name}$`, "i") },
  });

  if (existingRepo) {
    throw new ApiError(409, `You already have a repository named "${name}"`);
  }

  const fullName = `${owner.username}/${name}`.toLowerCase();

  const repository = await Repository.create({
    name,
    fullName,
    description: description || "",
    isPrivate: isPrivate ?? false,
    hasIssues: hasIssues ?? true,
    hasWiki: hasWiki ?? true,
    website: website || "",
    topics: topics || [],
    owner: owner._id,
    ownerType: "User",
    isInitialized: autoInit ?? false,
    defaultBranch: "main",
  });

  if (autoInit) {
    await initRepository(repository, owner);
  }

  return repository;
};

const getRepositoryByFullName = async (owner, repoName, requesterId) => {
  const fullName = `${owner}/${repoName}`.toLowerCase();

  const repository = await Repository.findOne({ fullName })
    .populate("owner", "username displayName avatarUrl")
    .populate("collaborators.user", "username displayName avatarUrl");

  if (!repository) {
    throw new ApiError(404, "Repository not found");
  }

  if (repository.isPrivate) {
    if (!requesterId) {
      throw new ApiError(404, "Repository not found");
    }

    const isOwner = repository.isOwnedBy(requesterId);
    const isCollaborator = repository.collaborators.some(
      (collab) => collab.user._id.toString() === requesterId.toString(),
    );

    if (!isOwner && !isCollaborator) {
      throw new ApiError(404, "Repository not found");
    }
  }

  return repository;
};

const getUserRepositories = async (username, requesterId, query) => {
  const user = await User.findOne({ username, isActive: true });

  if (!user) {
    throw new ApiError(404, `User "${username}" not found`);
  }

  const { page, limit, skip } = getPaginationParams(query);
  const isOwnProfile =
    requesterId && user._id.toString() === requesterId.toString();

  const filter = { owner: user._id, ownerType: "User" };
  if (!isOwnProfile) {
    filter.isPrivate = false;
  }

  if (query.type === "public") filter.isPrivate = false;
  if (query.type === "private" && isOwnProfile) filter.isPrivate = true;
  if (query.language) filter.language = query.language;
  if (query.topic) filter.topics = query.topic;

  const sortOptions = {
    updated: { updatedAt: -1 },
    created: { createdAt: -1 },
    pushed: { lastPushedAt: -1 },
    name: { name: 1 },
    stars: { starsCount: -1 },
  };

  const sort = sortOptions[query.sort] || { updatedAt: -1 };

  const [repositories, total] = await Promise.all([
    Repository.find(filter)
      .populate("owner", "username displayName avatarUrl")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Repository.countDocuments(filter),
  ]);

  const pagination = buildPaginationMeta(page, limit, total);

  return { repositories, pagination };
};

const updateRepository = async (repository, updates) => {
  const allowedFields = [
    "description",
    "isPrivate",
    "website",
    "defaultBranch",
    "hasIssues",
    "hasWiki",
    "hasDiscussions",
    "topics",
    "language",
  ];

  const sanitizedUpdates = {};
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      sanitizedUpdates[field] = updates[field];
    }
  });

  if (updates.name && updates.name !== repository.name) {
    const ownerUsername = repository.owner.username || repository.owner;

    const nameConflict = await Repository.findOne({
      owner: repository.owner._id || repository.owner,
      name: { $regex: new RegExp(`^${updates.name}$`, "i") },
      _id: { $ne: repository._id },
    });

    if (nameConflict) {
      throw new ApiError(
        409,
        `You already have a repository named "${updates.name}"`,
      );
    }

    sanitizedUpdates.name = updates.name;
    sanitizedUpdates.fullName =
      `${ownerUsername}/${updates.name}`.toLowerCase();
  }

  if (Object.keys(sanitizedUpdates).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  const updatedRepository = await Repository.findByIdAndUpdate(
    repository._id,
    { $set: sanitizedUpdates },
    { new: true, runValidators: true },
  ).populate("owner", "username displayName avatarUrl");

  return updatedRepository;
};

const deleteRepository = async (repository) => {
  await deleteRepositoryFromDisk(repository.fullName);
  await Repository.findByIdAndDelete(repository._id);
  return {
    message: `Repository "${repository.fullName}" deleted successfully`,
  };
};

const starRepository = async (repository, userId) => {
  if (repository.isStarredBy(userId)) {
    throw new ApiError(409, "You have already starred this repository");
  }

  await Repository.findByIdAndUpdate(repository._id, {
    $addToSet: { stars: userId },
  });

  await User.findByIdAndUpdate(userId, {
    $addToSet: { starredRepos: repository._id },
  });

  const updatedRepo = await Repository.findById(repository._id);

  await notifyRepoStarred({ repository, actor: userId });

  return {
    message: "Repository starred successfully",
    starsCount: updatedRepo.starsCount,
  };
};

const unstarRepository = async (repository, userId) => {
  if (!repository.isStarredBy(userId)) {
    throw new ApiError(409, "You have not starred this repository");
  }

  await Repository.findByIdAndUpdate(repository._id, {
    $pull: { stars: userId },
  });

  await User.findByIdAndUpdate(userId, {
    $pull: { starredRepos: repository._id },
  });

  const updatedRepo = await Repository.findById(repository._id);

  return {
    message: "Repository unstarred successfully",
    starsCount: updatedRepo.starsCount,
  };
};

const watchRepository = async (repository, userId) => {
  if (repository.isWatchedBy(userId)) {
    throw new ApiError(409, "You are already watching this repository");
  }

  await Repository.findByIdAndUpdate(repository._id, {
    $addToSet: { watchers: userId },
  });

  return { message: "You are now watching this repository" };
};

const unwatchRepository = async (repository, userId) => {
  if (!repository.isWatchedBy(userId)) {
    throw new ApiError(409, "You are not watching this repository");
  }

  await Repository.findByIdAndUpdate(repository._id, {
    $pull: { watchers: userId },
  });

  return { message: "You have unwatched this repository" };
};

const forkRepository = async (repository, user) => {
  if (repository.isOwnedBy(user._id)) {
    throw new ApiError(400, "You cannot fork your own repository");
  }

  const existingFork = await Repository.findOne({
    owner: user._id,
    forkedFrom: repository._id,
  });

  if (existingFork) {
    throw new ApiError(
      409,
      `You already have a fork of this repository: "${existingFork.fullName}"`,
    );
  }

  let forkName = repository.name;
  let nameConflict = await Repository.findOne({
    owner: user._id,
    name: { $regex: new RegExp(`^${forkName}$`, "i") },
  });

  let suffix = 1;
  while (nameConflict) {
    forkName = `${repository.name}-${suffix}`;
    nameConflict = await Repository.findOne({
      owner: user._id,
      name: { $regex: new RegExp(`^${forkName}$`, "i") },
    });
    suffix++;
  }

  const fork = await Repository.create({
    name: forkName,
    fullName: `${user.username}/${forkName}`.toLowerCase(),
    description: repository.description,
    isPrivate: false, // Forks are always public initially
    owner: user._id,
    ownerType: "User",
    forkedFrom: repository._id,
    defaultBranch: repository.defaultBranch,
    hasIssues: true,
    hasWiki: repository.hasWiki,
    topics: repository.topics,
    language: repository.language,
    isInitialized: repository.isInitialized,
  });

  await Repository.findByIdAndUpdate(repository._id, {
    $inc: { forkCount: 1 },
  });

  await notifyRepoForked({ repository, fork, actor: user._id });

  return fork;
};

const addCollaborator = async (repository, username, permission = "read") => {
  const collaboratorUser = await User.findOne({ username, isActive: true });

  if (!collaboratorUser) {
    throw new ApiError(404, `User "${username}" not found`);
  }

  if (repository.isOwnedBy(collaboratorUser._id)) {
    throw new ApiError(
      400,
      "The repository owner cannot be added as a collaborator",
    );
  }

  const alreadyCollaborator = repository.collaborators.some(
    (collab) => collab.user.toString() === collaboratorUser._id.toString(),
  );

  if (alreadyCollaborator) {
    throw new ApiError(
      409,
      `"${username}" is already a collaborator on this repository`,
    );
  }

  const updatedRepository = await Repository.findByIdAndUpdate(
    repository._id,
    {
      $push: {
        collaborators: {
          user: collaboratorUser._id,
          permission,
        },
      },
    },
    { new: true },
  ).populate("collaborators.user", "username displayName avatarUrl");

  const addedCollaborator = updatedRepository.collaborators.find(
    (collab) => collab.user._id.toString() === collaboratorUser._id.toString(),
  );

  await notifyCollaboratorAdded({
    repository,
    collaboratorId: collaboratorUser._id,
    actor: repository.owner._id || repository.owner,
  });

  return {
    message: `"${username}" added as a collaborator successfully`,
    collaborator: addedCollaborator,
  };
};

const updateCollaboratorPermission = async (
  repository,
  collaboratorUserId,
  permission,
) => {
  const collaborator = repository.collaborators.find(
    (collab) => collab.user.toString() === collaboratorUserId,
  );

  if (!collaborator) {
    throw new ApiError(404, "Collaborator not found on this repository");
  }

  await Repository.findOneAndUpdate(
    {
      _id: repository._id,
      "collaborators.user": collaboratorUserId,
    },
    {
      $set: { "collaborators.$.permission": permission },
    },
  );

  return { message: "Collaborator permission updated successfully" };
};

const removeCollaborator = async (repository, collaboratorUserId) => {
  const collaborator = repository.collaborators.find(
    (collab) => collab.user.toString() === collaboratorUserId,
  );

  if (!collaborator) {
    throw new ApiError(404, "Collaborator not found on this repository");
  }

  await Repository.findByIdAndUpdate(repository._id, {
    $pull: { collaborators: { user: collaboratorUserId } },
  });

  return { message: "Collaborator removed successfully" };
};

const getCollaborators = async (repository, query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const populatedRepo = await Repository.findById(repository._id).populate(
    "collaborators.user",
    "username displayName avatarUrl bio",
  );

  const total = populatedRepo.collaborators.length;
  const collaborators = populatedRepo.collaborators.slice(skip, skip + limit);
  const pagination = buildPaginationMeta(page, limit, total);

  return { collaborators, pagination };
};

export {
  createRepository,
  getRepositoryByFullName,
  getUserRepositories,
  updateRepository,
  deleteRepository,
  starRepository,
  unstarRepository,
  watchRepository,
  unwatchRepository,
  forkRepository,
  addCollaborator,
  updateCollaboratorPermission,
  removeCollaborator,
  getCollaborators,
};
