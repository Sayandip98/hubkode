import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
  getCommitHistory,
  getCommitBySha,
  createCommit,
} from "../services/git.service.js";

const listCommits = asyncHandler(async (req, res) => {
  const { branch } = req.query;

  const { commits, pagination } = await getCommitHistory(
    req.repository,
    branch || req.repository.defaultBranch,
    req.query,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { commits },
        "Commits fetched successfully",
        pagination,
      ),
    );
});

const getCommit = asyncHandler(async (req, res) => {
  const { sha } = req.params;

  const { commit, diff } = await getCommitBySha(req.repository, sha);

  res
    .status(200)
    .json(
      new ApiResponse(200, { commit, diff }, "Commit fetched successfully"),
    );
});

const create = asyncHandler(async (req, res) => {
  const { message, description, branch, files } = req.body;

  const commit = await createCommit({
    repository: req.repository,
    branch,
    message,
    description,
    files,
    user: req.user,
  });

  res
    .status(201)
    .json(new ApiResponse(201, { commit }, "Commit created successfully"));
});

export { listCommits, getCommit, create };
