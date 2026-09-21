import Issue from "../models/Issue.js";
import Comment from "../models/Comment.js";
import Repository from "../models/Repository.js";
import User from "../models/User.js";
import { ApiError } from "../utils/apiResponse.js";
import {
  getPaginationParams,
  buildPaginationMeta,
} from "../utils/pagination.js";
import { ISSUE_STATUS } from "../constants/status.js";
import {
  notifyIssueOpened,
  notifyIssueClosed,
  notifyIssueComment,
} from "./notification.service.js";

const createIssue = async ({
  title,
  body,
  assignees,
  labels,
  repository,
  author,
}) => {
  if (!repository.hasIssues) {
    throw new ApiError(403, "Issues are disabled for this repository");
  }

  if (assignees && assignees.length > 0) {
    const validAssignees = await User.find({
      _id: { $in: assignees },
      isActive: true,
    }).select("_id");

    if (validAssignees.length !== assignees.length) {
      throw new ApiError(400, "One or more assignees are invalid");
    }
  }

  const issue = await Issue.create({
    title,
    body: body || "",
    assignees: assignees || [],
    labels: labels || [],
    repository: repository._id,
    author: author._id,
    status: ISSUE_STATUS.OPEN,
  });

  await Repository.findByIdAndUpdate(repository._id, {
    $inc: { openIssuesCount: 1 },
  });

  await issue.populate([
    { path: "author", select: "username displayName avatarUrl" },
    { path: "assignees", select: "username displayName avatarUrl" },
  ]);

  await notifyIssueOpened({ issue, repository, actor: author._id });

  return issue;
};

const getIssues = async (repository, query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const filter = { repository: repository._id };

  if (query.status && Object.values(ISSUE_STATUS).includes(query.status)) {
    filter.status = query.status;
  } else {
    filter.status = ISSUE_STATUS.OPEN;
  }

  if (query.author) {
    const authorUser = await User.findOne({ username: query.author });
    if (authorUser) filter.author = authorUser._id;
  }

  if (query.assignee) {
    const assigneeUser = await User.findOne({ username: query.assignee });
    if (assigneeUser) filter.assignees = assigneeUser._id;
  }

  if (query.label) {
    filter["labels.name"] = query.label;
  }

  if (query.q) {
    filter.$text = { $search: query.q };
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    comments: { commentsCount: -1 },
    updated: { updatedAt: -1 },
  };

  const sort = sortOptions[query.sort] || { createdAt: -1 };

  const [issues, total] = await Promise.all([
    Issue.find(filter)
      .populate("author", "username displayName avatarUrl")
      .populate("assignees", "username displayName avatarUrl")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Issue.countDocuments(filter),
  ]);

  const pagination = buildPaginationMeta(page, limit, total);

  return { issues, pagination };
};

const getIssueByNumber = async (repository, issueNumber) => {
  const issue = await Issue.findOne({
    repository: repository._id,
    number: parseInt(issueNumber, 10),
  })
    .populate("author", "username displayName avatarUrl")
    .populate("assignees", "username displayName avatarUrl")
    .populate("closedBy", "username displayName avatarUrl")
    .populate("linkedPullRequests", "number title status");

  if (!issue) {
    throw new ApiError(404, `Issue #${issueNumber} not found`);
  }

  return issue;
};

const updateIssue = async (issue, updates, requestingUser) => {
  const isAuthor =
    issue.author._id.toString() === requestingUser._id.toString();

  if (!isAuthor) {
    const allowedFields = [
      "status",
      "assignees",
      "labels",
      "isPinned",
      "isLocked",
    ];
    const requestedFields = Object.keys(updates);
    const hasRestrictedFields = requestedFields.some(
      (field) => !allowedFields.includes(field),
    );

    if (hasRestrictedFields) {
      throw new ApiError(
        403,
        "Only the issue author can edit the title and body",
      );
    }
  }

  if (issue.isLocked && !updates.isLocked) {
    throw new ApiError(403, "This issue is locked");
  }

  const sanitizedUpdates = {};
  const allowedFields = [
    "title",
    "body",
    "status",
    "assignees",
    "labels",
    "isPinned",
    "isLocked",
  ];

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      sanitizedUpdates[field] = updates[field];
    }
  });

  const wasOpen = issue.status === ISSUE_STATUS.OPEN;
  const isClosing = updates.status === ISSUE_STATUS.CLOSED;
  const isReopening = updates.status === ISSUE_STATUS.OPEN;

  if (isClosing && wasOpen) {
    sanitizedUpdates.closedAt = new Date();
    sanitizedUpdates.closedBy = requestingUser._id;
    await Repository.findByIdAndUpdate(issue.repository, {
      $inc: { openIssuesCount: -1 },
    });
  }

  if (isReopening && !wasOpen) {
    sanitizedUpdates.closedAt = null;
    sanitizedUpdates.closedBy = null;
    await Repository.findByIdAndUpdate(issue.repository, {
      $inc: { openIssuesCount: 1 },
    });
  }

  const updatedIssue = await Issue.findByIdAndUpdate(
    issue._id,
    { $set: sanitizedUpdates },
    { new: true, runValidators: true },
  )
    .populate("author", "username displayName avatarUrl")
    .populate("assignees", "username displayName avatarUrl")
    .populate("closedBy", "username displayName avatarUrl");

  return updatedIssue;
};

const deleteIssue = async (issue, requestingUser) => {
  const isAuthor =
    issue.author._id.toString() === requestingUser._id.toString();
  const isAdmin = requestingUser.role === "admin";

  if (!isAuthor && !isAdmin) {
    throw new ApiError(
      403,
      "Only the issue author or admin can delete this issue",
    );
  }

  await Comment.deleteMany({ parent: issue._id, parentType: "Issue" });

  if (issue.status === ISSUE_STATUS.OPEN) {
    await Repository.findByIdAndUpdate(issue.repository, {
      $inc: { openIssuesCount: -1 },
    });
  }

  await Issue.findByIdAndDelete(issue._id);

  return { message: `Issue #${issue.number} deleted successfully` };
};

const createComment = async ({ body, issue, author }) => {
  if (issue.isLocked) {
    throw new ApiError(403, "This issue is locked. Comments are disabled.");
  }

  const comment = await Comment.create({
    body,
    author: author._id,
    repository: issue.repository,
    parentType: "Issue",
    parent: issue._id,
  });

  await Issue.findByIdAndUpdate(issue._id, {
    $inc: { commentsCount: 1 },
  });

  await comment.populate("author", "username displayName avatarUrl");

  await notifyIssueComment({
    comment,
    issue,
    repository: { _id: issue.repository },
    actor: author._id,
  });

  return comment;
};

const getComments = async (issue, query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const filter = { parent: issue._id, parentType: "Issue" };

  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .populate("author", "username displayName avatarUrl")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit),
    Comment.countDocuments(filter),
  ]);

  const pagination = buildPaginationMeta(page, limit, total);

  return { comments, pagination };
};

const updateComment = async (commentId, body, requestingUser) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const isAuthor = comment.author.toString() === requestingUser._id.toString();

  if (!isAuthor) {
    throw new ApiError(403, "Only the comment author can edit this comment");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        body,
        isEdited: true,
        editedAt: new Date(),
      },
    },
    { new: true, runValidators: true },
  ).populate("author", "username displayName avatarUrl");

  return updatedComment;
};

const deleteComment = async (commentId, requestingUser) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const isAuthor = comment.author.toString() === requestingUser._id.toString();
  const isAdmin = requestingUser.role === "admin";

  if (!isAuthor && !isAdmin) {
    throw new ApiError(
      403,
      "Only the comment author or admin can delete this comment",
    );
  }

  await Comment.findByIdAndDelete(commentId);

  await Issue.findByIdAndUpdate(comment.parent, {
    $inc: { commentsCount: -1 },
  });

  return { message: "Comment deleted successfully" };
};

const addReaction = async (commentId, emoji, userId) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const reactionIndex = comment.reactions.findIndex((r) => r.emoji === emoji);

  if (reactionIndex === -1) {
    await Comment.findByIdAndUpdate(commentId, {
      $push: { reactions: { emoji, users: [userId] } },
    });
  } else {
    const hasReacted = comment.reactions[reactionIndex].users.some(
      (id) => id.toString() === userId.toString(),
    );

    if (hasReacted) {
      await Comment.findByIdAndUpdate(commentId, {
        $pull: { [`reactions.${reactionIndex}.users`]: userId },
      });
    } else {
      await Comment.findByIdAndUpdate(commentId, {
        $push: { [`reactions.${reactionIndex}.users`]: userId },
      });
    }
  }

  const updatedComment = await Comment.findById(commentId).populate(
    "author",
    "username displayName avatarUrl",
  );

  return updatedComment;
};

export {
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
};
