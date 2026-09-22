import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse, ApiError } from "../utils/apiResponse.js";
import Repository from "../models/Repository.js";
import Issue from "../models/Issue.js";
import Comment from "../models/Comment.js";
import PullRequest from "../models/PullRequest.js";
import Commit from "../models/Commit.js";
import {
  explainCode,
  reviewCode,
  summarizeIssue,
  summarizePullRequest,
  generateCommitMessage,
  analyzeRepositoryHealth,
  suggestIssueLabels,
  generatePRDescription,
} from "../services/ai.service.js";
import { getFileContent, getCommitBySha } from "../services/git.service.js";

const explain = asyncHandler(async (req, res) => {
  const { code, language, filename } = req.body;

  const result = await explainCode({ code, language, filename });

  res
    .status(200)
    .json(new ApiResponse(200, result, "Code explained successfully"));
});

const review = asyncHandler(async (req, res) => {
  const { code, language, filename, context } = req.body;

  const result = await reviewCode({ code, language, filename, context });

  res
    .status(200)
    .json(new ApiResponse(200, result, "Code reviewed successfully"));
});

const explainFile = asyncHandler(async (req, res) => {
  const { owner, repoName, branch, path: filePath } = req.params;
  const fullName = `${owner}/${repoName}`.toLowerCase();

  const repository = await Repository.findOne({ fullName });

  if (!repository) {
    throw new ApiError(404, "Repository not found");
  }

  const fileData = await getFileContent(repository, branch, filePath);

  if (fileData.isBinary) {
    throw new ApiError(400, "Cannot explain binary files");
  }

  const extension = filePath.split(".").pop();

  const result = await explainCode({
    code: fileData.content,
    language: extension,
    filename: fileData.name,
  });

  res
    .status(200)
    .json(new ApiResponse(200, result, "File explained successfully"));
});

const reviewFile = asyncHandler(async (req, res) => {
  const { owner, repoName, branch, path: filePath } = req.params;
  const fullName = `${owner}/${repoName}`.toLowerCase();

  const repository = await Repository.findOne({ fullName });

  if (!repository) {
    throw new ApiError(404, "Repository not found");
  }

  const fileData = await getFileContent(repository, branch, filePath);

  if (fileData.isBinary) {
    throw new ApiError(400, "Cannot review binary files");
  }

  const extension = filePath.split(".").pop();

  const result = await reviewCode({
    code: fileData.content,
    language: extension,
    filename: fileData.name,
    context: req.body.context || "",
  });

  res
    .status(200)
    .json(new ApiResponse(200, result, "File reviewed successfully"));
});

const summarizeIssueById = asyncHandler(async (req, res) => {
  const { owner, repoName, issueNumber } = req.params;
  const fullName = `${owner}/${repoName}`.toLowerCase();

  const repository = await Repository.findOne({ fullName });

  if (!repository) {
    throw new ApiError(404, "Repository not found");
  }

  const issue = await Issue.findOne({
    repository: repository._id,
    number: parseInt(issueNumber, 10),
  }).populate("author", "username displayName");

  if (!issue) {
    throw new ApiError(404, `Issue #${issueNumber} not found`);
  }

  const comments = await Comment.find({
    parent: issue._id,
    parentType: "Issue",
  })
    .populate("author", "username")
    .sort({ createdAt: 1 })
    .limit(30);

  const result = await summarizeIssue({ issue, comments });

  res
    .status(200)
    .json(new ApiResponse(200, result, "Issue summarized successfully"));
});

const summarizePRById = asyncHandler(async (req, res) => {
  const { owner, repoName, prNumber } = req.params;
  const fullName = `${owner}/${repoName}`.toLowerCase();

  const repository = await Repository.findOne({ fullName });

  if (!repository) {
    throw new ApiError(404, "Repository not found");
  }

  const pullRequest = await PullRequest.findOne({
    repository: repository._id,
    number: parseInt(prNumber, 10),
  }).populate("author", "username displayName");

  if (!pullRequest) {
    throw new ApiError(404, `Pull request #${prNumber} not found`);
  }

  const comments = await Comment.find({
    parent: pullRequest._id,
    parentType: "PullRequest",
  })
    .populate("author", "username")
    .sort({ createdAt: 1 })
    .limit(20);

  const result = await summarizePullRequest({
    pullRequest,
    comments,
    diff: null,
  });

  res
    .status(200)
    .json(new ApiResponse(200, result, "Pull request summarized successfully"));
});

const generateCommit = asyncHandler(async (req, res) => {
  const { diff, context } = req.body;

  if (!diff || diff.length === 0) {
    throw new ApiError(400, "Diff data is required");
  }

  const result = await generateCommitMessage({ diff, context });

  res
    .status(200)
    .json(
      new ApiResponse(200, result, "Commit message generated successfully"),
    );
});

const repoHealth = asyncHandler(async (req, res) => {
  const { owner, repoName } = req.params;
  const fullName = `${owner}/${repoName}`.toLowerCase();

  const repository = await Repository.findOne({ fullName }).populate(
    "owner",
    "username displayName",
  );

  if (!repository) {
    throw new ApiError(404, "Repository not found");
  }

  const [totalCommits, totalIssues, totalPRs] = await Promise.all([
    Commit.countDocuments({ repository: repository._id }),
    Issue.countDocuments({ repository: repository._id }),
    PullRequest.countDocuments({ repository: repository._id }),
  ]);

  const stats = {
    totalCommits,
    totalIssues,
    totalPRs,
    contributors: repository.collaborators?.length + 1 || 1,
  };

  const result = await analyzeRepositoryHealth({ repository, stats });

  res
    .status(200)
    .json(
      new ApiResponse(200, result, "Repository health analyzed successfully"),
    );
});

const suggestLabels = asyncHandler(async (req, res) => {
  const { owner, repoName, issueNumber } = req.params;
  const fullName = `${owner}/${repoName}`.toLowerCase();

  const repository = await Repository.findOne({ fullName });

  if (!repository) {
    throw new ApiError(404, "Repository not found");
  }

  const issue = await Issue.findOne({
    repository: repository._id,
    number: parseInt(issueNumber, 10),
  });

  if (!issue) {
    throw new ApiError(404, `Issue #${issueNumber} not found`);
  }

  const result = await suggestIssueLabels({ issue });

  res
    .status(200)
    .json(
      new ApiResponse(200, result, "Label suggestions generated successfully"),
    );
});

const generatePRDesc = asyncHandler(async (req, res) => {
  const { owner, repoName } = req.params;
  const { sourceBranch, targetBranch } = req.body;
  const fullName = `${owner}/${repoName}`.toLowerCase();

  const repository = await Repository.findOne({ fullName });

  if (!repository) {
    throw new ApiError(404, "Repository not found");
  }

  const commits = await Commit.find({ repository: repository._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .select("message sha");

  const result = await generatePRDescription({
    sourceBranch,
    targetBranch,
    commits,
    diff: null,
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "Pull request description generated successfully",
      ),
    );
});

export {
  explain,
  review,
  explainFile,
  reviewFile,
  summarizeIssueById,
  summarizePRById,
  generateCommit,
  repoHealth,
  suggestLabels,
  generatePRDesc,
};
