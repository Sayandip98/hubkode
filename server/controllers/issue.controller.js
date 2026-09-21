import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
  createIssue,
  getIssues,
  getIssueByNumber,
  updateIssue,
  deleteIssue,
  createComment,
  getComments,
  updateComment,
  deleteComment,
  addReaction,
} from "../services/issue.service.js";

const create = asyncHandler(async (req, res) => {
  const { title, body, assignees, labels } = req.body;

  const issue = await createIssue({
    title,
    body,
    assignees,
    labels,
    repository: req.repository,
    author: req.user,
  });

  res
    .status(201)
    .json(new ApiResponse(201, { issue }, "Issue created successfully"));
});

const list = asyncHandler(async (req, res) => {
  const { issues, pagination } = await getIssues(req.repository, req.query);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { issues },
        "Issues fetched successfully",
        pagination,
      ),
    );
});

const getOne = asyncHandler(async (req, res) => {
  const { issueNumber } = req.params;

  const issue = await getIssueByNumber(req.repository, issueNumber);

  res
    .status(200)
    .json(new ApiResponse(200, { issue }, "Issue fetched successfully"));
});

const update = asyncHandler(async (req, res) => {
  const { issueNumber } = req.params;

  const issue = await getIssueByNumber(req.repository, issueNumber);
  const updatedIssue = await updateIssue(issue, req.body, req.user);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { issue: updatedIssue },
        "Issue updated successfully",
      ),
    );
});

const remove = asyncHandler(async (req, res) => {
  const { issueNumber } = req.params;

  const issue = await getIssueByNumber(req.repository, issueNumber);
  const result = await deleteIssue(issue, req.user);

  res.status(200).json(new ApiResponse(200, null, result.message));
});

const listComments = asyncHandler(async (req, res) => {
  const { issueNumber } = req.params;

  const issue = await getIssueByNumber(req.repository, issueNumber);
  const { comments, pagination } = await getComments(issue, req.query);

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
  const { issueNumber } = req.params;
  const { body } = req.body;

  const issue = await getIssueByNumber(req.repository, issueNumber);
  const comment = await createComment({ body, issue, author: req.user });

  res
    .status(201)
    .json(new ApiResponse(201, { comment }, "Comment added successfully"));
});

const editComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { body } = req.body;

  const comment = await updateComment(commentId, body, req.user);

  res
    .status(200)
    .json(new ApiResponse(200, { comment }, "Comment updated successfully"));
});

const removeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const result = await deleteComment(commentId, req.user);

  res.status(200).json(new ApiResponse(200, null, result.message));
});

const toggleReaction = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { emoji } = req.body;

  const comment = await addReaction(commentId, emoji, req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, { comment }, "Reaction toggled successfully"));
});

export {
  create,
  list,
  getOne,
  update,
  remove,
  listComments,
  addComment,
  editComment,
  removeComment,
  toggleReaction,
};
