import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
  getBranches,
  createBranch,
  deleteBranch,
} from "../services/git.service.js";

const listBranches = asyncHandler(async (req, res) => {
  const branches = await getBranches(req.repository);

  res
    .status(200)
    .json(new ApiResponse(200, { branches }, "Branches fetched successfully"));
});

const create = asyncHandler(async (req, res) => {
  const { name, sourceBranch } = req.body;

  const branch = await createBranch(
    req.repository,
    name,
    sourceBranch || req.repository.defaultBranch,
    req.user,
  );

  res
    .status(201)
    .json(new ApiResponse(201, { branch }, "Branch created successfully"));
});

const remove = asyncHandler(async (req, res) => {
  const { branch } = req.params;

  const result = await deleteBranch(req.repository, branch);

  res.status(200).json(new ApiResponse(200, null, result.message));
});

export { listBranches, create, remove };
