import Repository from "../models/Repository.js";
import User from "../models/User.js";
import Issue from "../models/Issue.js";
import PullRequest from "../models/PullRequest.js";
import Organization from "../models/Organization.js";
import { ApiError } from "../utils/apiResponse.js";
import {
  getPaginationParams,
  buildPaginationMeta,
} from "../utils/pagination.js";

const searchRepositories = async (query, requesterId) => {
  const { page, limit, skip } = getPaginationParams(query);

  if (!query.q || query.q.trim().length === 0) {
    throw new ApiError(400, "Search query is required");
  }

  const filter = {
    $text: { $search: query.q },
  };

  if (!requesterId) {
    filter.isPrivate = false;
  } else {
    filter.$or = [
      { isPrivate: false },
      { owner: requesterId },
      { "collaborators.user": requesterId },
    ];
  }

  if (query.language) filter.language = query.language;
  if (query.topic) filter.topics = query.topic;
  if (query.type === "public") filter.isPrivate = false;
  if (query.type === "private" && requesterId) filter.isPrivate = true;

  const sortOptions = {
    stars: { starsCount: -1 },
    updated: { updatedAt: -1 },
    created: { createdAt: -1 },
    pushed: { lastPushedAt: -1 },
    relevance: { score: { $meta: "textScore" } },
  };

  const sort = sortOptions[query.sort] || { score: { $meta: "textScore" } };

  const [repositories, total] = await Promise.all([
    Repository.find(filter, { score: { $meta: "textScore" } })
      .populate("owner", "username displayName avatarUrl")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Repository.countDocuments(filter),
  ]);

  const pagination = buildPaginationMeta(page, limit, total);

  return { repositories, pagination };
};

const searchUsers = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);

  if (!query.q || query.q.trim().length === 0) {
    throw new ApiError(400, "Search query is required");
  }

  const filter = {
    isActive: true,
    $text: { $search: query.q },
  };

  if (query.location)
    filter.location = { $regex: query.location, $options: "i" };

  const [users, total] = await Promise.all([
    User.find(filter, { score: { $meta: "textScore" } })
      .select("username displayName avatarUrl bio location company")
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  const pagination = buildPaginationMeta(page, limit, total);

  return { users, pagination };
};

const searchIssues = async (query, requesterId) => {
  const { page, limit, skip } = getPaginationParams(query);

  if (!query.q || query.q.trim().length === 0) {
    throw new ApiError(400, "Search query is required");
  }

  let accessibleRepoIds = [];

  if (requesterId) {
    const accessibleRepos = await Repository.find({
      $or: [
        { isPrivate: false },
        { owner: requesterId },
        { "collaborators.user": requesterId },
      ],
    }).select("_id");

    accessibleRepoIds = accessibleRepos.map((r) => r._id);
  } else {
    const publicRepos = await Repository.find({ isPrivate: false }).select(
      "_id",
    );
    accessibleRepoIds = publicRepos.map((r) => r._id);
  }

  const filter = {
    repository: { $in: accessibleRepoIds },
    $text: { $search: query.q },
  };

  if (query.status && ["open", "closed"].includes(query.status)) {
    filter.status = query.status;
  }

  if (query.author) {
    const authorUser = await User.findOne({ username: query.author });
    if (authorUser) filter.author = authorUser._id;
  }

  if (query.label) filter["labels.name"] = query.label;

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    comments: { commentsCount: -1 },
    updated: { updatedAt: -1 },
    relevance: { score: { $meta: "textScore" } },
  };

  const sort = sortOptions[query.sort] || { score: { $meta: "textScore" } };

  const [issues, total] = await Promise.all([
    Issue.find(filter, { score: { $meta: "textScore" } })
      .populate("author", "username displayName avatarUrl")
      .populate("repository", "name fullName")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Issue.countDocuments(filter),
  ]);

  const pagination = buildPaginationMeta(page, limit, total);

  return { issues, pagination };
};

const searchPullRequests = async (query, requesterId) => {
  const { page, limit, skip } = getPaginationParams(query);

  if (!query.q || query.q.trim().length === 0) {
    throw new ApiError(400, "Search query is required");
  }

  let accessibleRepoIds = [];

  if (requesterId) {
    const accessibleRepos = await Repository.find({
      $or: [
        { isPrivate: false },
        { owner: requesterId },
        { "collaborators.user": requesterId },
      ],
    }).select("_id");

    accessibleRepoIds = accessibleRepos.map((r) => r._id);
  } else {
    const publicRepos = await Repository.find({ isPrivate: false }).select(
      "_id",
    );
    accessibleRepoIds = publicRepos.map((r) => r._id);
  }

  const filter = {
    repository: { $in: accessibleRepoIds },
    $text: { $search: query.q },
  };

  if (
    query.status &&
    ["open", "closed", "merged", "draft"].includes(query.status)
  ) {
    filter.status = query.status;
  }

  if (query.author) {
    const authorUser = await User.findOne({ username: query.author });
    if (authorUser) filter.author = authorUser._id;
  }

  if (query.label) filter["labels.name"] = query.label;

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    comments: { commentsCount: -1 },
    updated: { updatedAt: -1 },
    relevance: { score: { $meta: "textScore" } },
  };

  const sort = sortOptions[query.sort] || { score: { $meta: "textScore" } };

  const [pullRequests, total] = await Promise.all([
    PullRequest.find(filter, { score: { $meta: "textScore" } })
      .populate("author", "username displayName avatarUrl")
      .populate("repository", "name fullName")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    PullRequest.countDocuments(filter),
  ]);

  const pagination = buildPaginationMeta(page, limit, total);

  return { pullRequests, pagination };
};

const searchOrganizations = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);

  if (!query.q || query.q.trim().length === 0) {
    throw new ApiError(400, "Search query is required");
  }

  const filter = {
    $text: { $search: query.q },
  };

  const [organizations, total] = await Promise.all([
    Organization.find(filter, { score: { $meta: "textScore" } })
      .select("name displayName description avatarUrl location members")
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit),
    Organization.countDocuments(filter),
  ]);

  const pagination = buildPaginationMeta(page, limit, total);

  return { organizations, pagination };
};

const globalSearch = async (query, requesterId) => {
  if (!query.q || query.q.trim().length === 0) {
    throw new ApiError(400, "Search query is required");
  }

  const limit = 5;

  const publicRepoFilter = requesterId
    ? {
        $or: [
          { isPrivate: false },
          { owner: requesterId },
          { "collaborators.user": requesterId },
        ],
        $text: { $search: query.q },
      }
    : { isPrivate: false, $text: { $search: query.q } };

  const [repositories, users, issues, organizations] = await Promise.all([
    Repository.find(publicRepoFilter, { score: { $meta: "textScore" } })
      .populate("owner", "username displayName avatarUrl")
      .sort({ score: { $meta: "textScore" } })
      .limit(limit),

    User.find(
      { isActive: true, $text: { $search: query.q } },
      { score: { $meta: "textScore" } },
    )
      .select("username displayName avatarUrl bio")
      .sort({ score: { $meta: "textScore" } })
      .limit(limit),

    Issue.find(
      { $text: { $search: query.q } },
      { score: { $meta: "textScore" } },
    )
      .populate("author", "username displayName avatarUrl")
      .populate("repository", "name fullName")
      .sort({ score: { $meta: "textScore" } })
      .limit(limit),

    Organization.find(
      { $text: { $search: query.q } },
      { score: { $meta: "textScore" } },
    )
      .select("name displayName description avatarUrl")
      .sort({ score: { $meta: "textScore" } })
      .limit(limit),
  ]);

  return { repositories, users, issues, organizations };
};

const getExploreRepositories = async (query, requesterId) => {
  const { page, limit, skip } = getPaginationParams(query);

  const filter = { isPrivate: false, isArchived: false };

  if (query.language) filter.language = query.language;
  if (query.topic) filter.topics = query.topic;

  const sortOptions = {
    stars: { stars: -1 },
    updated: { updatedAt: -1 },
    created: { createdAt: -1 },
    pushed: { lastPushedAt: -1 },
    forks: { forkCount: -1 },
  };

  const sort = sortOptions[query.sort] || { stars: -1 };

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

export {
  searchRepositories,
  searchUsers,
  searchIssues,
  searchPullRequests,
  searchOrganizations,
  globalSearch,
  getExploreRepositories,
};
