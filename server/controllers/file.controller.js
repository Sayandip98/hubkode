import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { getFileTree, getFileContent } from "../services/git.service.js";

const getTree = asyncHandler(async (req, res) => {
  const { branch } = req.params;
  const treePath = req.params.path || "";

  const result = await getFileTree(req.repository, branch, treePath);

  res
    .status(200)
    .json(new ApiResponse(200, result, "File tree fetched successfully"));
});

const getFile = asyncHandler(async (req, res) => {
  const { branch } = req.params;
  const filePath = req.params.path;

  const result = await getFileContent(req.repository, branch, filePath);

  res
    .status(200)
    .json(new ApiResponse(200, result, "File content fetched successfully"));
});

export { getTree, getFile };
