import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
  searchRepositories,
  searchUsers,
  searchIssues,
  searchPullRequests,
  searchOrganizations,
  globalSearch,
  getExploreRepositories,
} from "../services/search.service.js";

const repositories = asyncHandler(async (req, res) => {
  const requesterId = req.user?._id || null;

  const { repositories: repos, pagination } = await searchRepositories(
    req.query,
    requesterId,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { repositories: repos },
        "Repositories fetched successfully",
        pagination,
      ),
    );
});

const users = asyncHandler(async (req, res) => {
  const { users: foundUsers, pagination } = await searchUsers(req.query);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { users: foundUsers },
        "Users fetched successfully",
        pagination,
      ),
    );
});

const issues = asyncHandler(async (req, res) => {
  const requesterId = req.user?._id || null;

  const { issues: foundIssues, pagination } = await searchIssues(
    req.query,
    requesterId,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { issues: foundIssues },
        "Issues fetched successfully",
        pagination,
      ),
    );
});

const pullRequests = asyncHandler(async (req, res) => {
  const requesterId = req.user?._id || null;

  const { pullRequests: foundPRs, pagination } = await searchPullRequests(
    req.query,
    requesterId,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { pullRequests: foundPRs },
        "Pull requests fetched successfully",
        pagination,
      ),
    );
});

const organizations = asyncHandler(async (req, res) => {
  const { organizations: orgs, pagination } = await searchOrganizations(
    req.query,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { organizations: orgs },
        "Organizations fetched successfully",
        pagination,
      ),
    );
});

const global = asyncHandler(async (req, res) => {
  const requesterId = req.user?._id || null;

  const results = await globalSearch(req.query, requesterId);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        results,
        "Global search results fetched successfully",
      ),
    );
});

const explore = asyncHandler(async (req, res) => {
  const requesterId = req.user?._id || null;

  const { repositories: repos, pagination } = await getExploreRepositories(
    req.query,
    requesterId,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { repositories: repos },
        "Explore repositories fetched successfully",
        pagination,
      ),
    );
});

export {
  repositories,
  users,
  issues,
  pullRequests,
  organizations,
  global,
  explore,
};
