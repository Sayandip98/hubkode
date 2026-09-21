import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
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
} from "../services/repository.service.js";

const create = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    isPrivate,
    hasIssues,
    hasWiki,
    website,
    topics,
    autoInit,
  } = req.body;

  const repository = await createRepository({
    name,
    description,
    isPrivate,
    hasIssues,
    hasWiki,
    website,
    topics,
    autoInit,
    owner: req.user,
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, { repository }, "Repository created successfully"),
    );
});

const getRepository = asyncHandler(async (req, res) => {
  const { owner, repoName } = req.params;
  const requesterId = req.user?._id || null;

  const repository = await getRepositoryByFullName(
    owner,
    repoName,
    requesterId,
  );

  const isOwner = requesterId ? repository.isOwnedBy(requesterId) : false;

  const isStarred = requesterId ? repository.isStarredBy(requesterId) : false;

  const isWatched = requesterId ? repository.isWatchedBy(requesterId) : false;

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { repository, isOwner, isStarred, isWatched },
        "Repository fetched successfully",
      ),
    );
});

const getUserRepos = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const requesterId = req.user?._id || null;

  const { repositories, pagination } = await getUserRepositories(
    username,
    requesterId,
    req.query,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { repositories },
        "Repositories fetched successfully",
        pagination,
      ),
    );
});

const update = asyncHandler(async (req, res) => {
  const repository = await updateRepository(req.repository, req.body);

  res
    .status(200)
    .json(
      new ApiResponse(200, { repository }, "Repository updated successfully"),
    );
});

const remove = asyncHandler(async (req, res) => {
  const result = await deleteRepository(req.repository);

  res.status(200).json(new ApiResponse(200, null, result.message));
});

const star = asyncHandler(async (req, res) => {
  const result = await starRepository(req.repository, req.user._id);

  res
    .status(200)
    .json(
      new ApiResponse(200, { starsCount: result.starsCount }, result.message),
    );
});

const unstar = asyncHandler(async (req, res) => {
  const result = await unstarRepository(req.repository, req.user._id);

  res
    .status(200)
    .json(
      new ApiResponse(200, { starsCount: result.starsCount }, result.message),
    );
});

const watch = asyncHandler(async (req, res) => {
  const result = await watchRepository(req.repository, req.user._id);

  res.status(200).json(new ApiResponse(200, null, result.message));
});

const unwatch = asyncHandler(async (req, res) => {
  const result = await unwatchRepository(req.repository, req.user._id);

  res.status(200).json(new ApiResponse(200, null, result.message));
});

const fork = asyncHandler(async (req, res) => {
  const repository = await forkRepository(req.repository, req.user);

  res
    .status(201)
    .json(
      new ApiResponse(201, { repository }, "Repository forked successfully"),
    );
});

const listCollaborators = asyncHandler(async (req, res) => {
  const { collaborators, pagination } = await getCollaborators(
    req.repository,
    req.query,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { collaborators },
        "Collaborators fetched successfully",
        pagination,
      ),
    );
});

const addCollaboratorToRepo = asyncHandler(async (req, res) => {
  const { username, permission } = req.body;

  const result = await addCollaborator(req.repository, username, permission);

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { collaborator: result.collaborator },
        result.message,
      ),
    );
});

const updateCollaborator = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { permission } = req.body;

  const result = await updateCollaboratorPermission(
    req.repository,
    userId,
    permission,
  );

  res.status(200).json(new ApiResponse(200, null, result.message));
});

const removeCollaboratorFromRepo = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const result = await removeCollaborator(req.repository, userId);

  res.status(200).json(new ApiResponse(200, null, result.message));
});

export {
  create,
  getRepository,
  getUserRepos,
  update,
  remove,
  star,
  unstar,
  watch,
  unwatch,
  fork,
  listCollaborators,
  addCollaboratorToRepo,
  updateCollaborator,
  removeCollaboratorFromRepo,
};
