import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
  createPullRequest,
  getPullRequests,
  getPullRequestByNumber,
  getPullRequestDiff,
  updatePullRequest,
  mergePullRequest,
  submitReview,
  resolveReviewComment,
  getPRComments,
  addPRComment,
  updatePRComment,
  deletePRComment,
} from "../services/pullRequest.service.js";

const create = asyncHandler(async (req, res) => {
  const {
    title,
    body,
    sourceBranch,
    targetBranch,
    isDraft,
    assignees,
    requestedReviewers,
    labels,
    linkedIssues,
  } = req.body;

  const pullRequest = await createPullRequest({
    title,
    body,
    sourceBranch,
    targetBranch,
    isDraft,
    assignees,
    requestedReviewers,
    labels,
    linkedIssues,
    repository: req.repository,
    author: req.user,
  });

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { pullRequest },
        "Pull request created successfully",
      ),
    );
});

const list = asyncHandler(async (req, res) => {
  const { pullRequests, pagination } = await getPullRequests(
    req.repository,
    req.query,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { pullRequests },
        "Pull requests fetched successfully",
        pagination,
      ),
    );
});

const getOne = asyncHandler(async (req, res) => {
  const { prNumber } = req.params;

  const pullRequest = await getPullRequestByNumber(req.repository, prNumber);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { pullRequest },
        "Pull request fetched successfully",
      ),
    );
});

const getDiff = asyncHandler(async (req, res) => {
  const { prNumber } = req.params;

  const { pullRequest, diff } = await getPullRequestDiff(
    req.repository,
    prNumber,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { pullRequest, diff },
        "Pull request diff fetched successfully",
      ),
    );
});

const update = asyncHandler(async (req, res) => {
  const { prNumber } = req.params;

  const pullRequest = await getPullRequestByNumber(req.repository, prNumber);
  const updatedPR = await updatePullRequest(pullRequest, req.body, req.user);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { pullRequest: updatedPR },
        "Pull request updated successfully",
      ),
    );
});

const merge = asyncHandler(async (req, res) => {
  const { prNumber } = req.params;

  const pullRequest = await getPullRequestByNumber(req.repository, prNumber);
  const mergedPR = await mergePullRequest(
    pullRequest,
    req.repository,
    req.user,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { pullRequest: mergedPR },
        "Pull request merged successfully",
      ),
    );
});

const review = asyncHandler(async (req, res) => {
  const { prNumber } = req.params;

  const pullRequest = await getPullRequestByNumber(req.repository, prNumber);
  const updatedPR = await submitReview(pullRequest, req.body, req.user);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { pullRequest: updatedPR },
        "Review submitted successfully",
      ),
    );
});

const resolveComment = asyncHandler(async (req, res) => {
  const { prNumber, reviewId, commentId } = req.params;

  const pullRequest = await getPullRequestByNumber(req.repository, prNumber);
  const updatedPR = await resolveReviewComment(
    pullRequest,
    reviewId,
    commentId,
    req.user,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { pullRequest: updatedPR },
        "Review comment resolved successfully",
      ),
    );
});

const listComments = asyncHandler(async (req, res) => {
  const { prNumber } = req.params;

  const pullRequest = await getPullRequestByNumber(req.repository, prNumber);
  const { comments, pagination } = await getPRComments(pullRequest, req.query);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { comments },
        "Comments fetched successfully",
        pagination,
      ),
    );
});

const addComment = asyncHandler(async (req, res) => {
  const { prNumber } = req.params;
  const { body } = req.body;

  const pullRequest = await getPullRequestByNumber(req.repository, prNumber);
  const comment = await addPRComment({ body, pullRequest, author: req.user });

  res
    .status(201)
    .json(new ApiResponse(201, { comment }, "Comment added successfully"));
});

const editComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { body } = req.body;

  const comment = await updatePRComment(commentId, body, req.user);

  res
    .status(200)
    .json(new ApiResponse(200, { comment }, "Comment updated successfully"));
});

const removeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const result = await deletePRComment(commentId, req.user);

  res.status(200).json(new ApiResponse(200, null, result.message));
});

export {
  create,
  list,
  getOne,
  getDiff,
  update,
  merge,
  review,
  resolveComment,
  listComments,
  addComment,
  editComment,
  removeComment,
};
