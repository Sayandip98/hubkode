import PullRequest from "../models/PullRequest.js";
import Repository from "../models/Repository.js";
import Branch from "../models/Branch.js";
import Issue from "../models/Issue.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import { ApiError } from "../utils/apiResponse.js";
import {
  getPaginationParams,
  buildPaginationMeta,
} from "../utils/pagination.js";
import { PR_STATUS, REVIEW_STATE, ISSUE_STATUS } from "../constants/status.js";
import git from "isomorphic-git";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  notifyPROpened,
  notifyPRMerged,
  notifyPRReviewRequested,
  notifyPRReviewed,
} from "./notification.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPOS_BASE_PATH = path.join(__dirname, "../../repos");

const getRepoPath = (fullName) => path.join(REPOS_BASE_PATH, fullName);

const createPullRequest = async ({
  title,
  body,
  sourceBranch,
  targetBranch,
  isDraft,
  assignees,
  requestedReviewers,
  labels,
  linkedIssues,
  repository,
  author,
}) => {
  const [sourceBranchDoc, targetBranchDoc] = await Promise.all([
    Branch.findOne({ repository: repository._id, name: sourceBranch }),
    Branch.findOne({ repository: repository._id, name: targetBranch }),
  ]);

  if (!sourceBranchDoc) {
    throw new ApiError(404, `Source branch "${sourceBranch}" not found`);
  }

  if (!targetBranchDoc) {
    throw new ApiError(404, `Target branch "${targetBranch}" not found`);
  }

  const existingOpenPR = await PullRequest.findOne({
    repository: repository._id,
    sourceBranch,
    targetBranch,
    status: PR_STATUS.OPEN,
  });

  if (existingOpenPR) {
    throw new ApiError(
      409,
      `An open pull request already exists for "${sourceBranch}" → "${targetBranch}"`,
    );
  }

  let additions = 0;
  let deletions = 0;
  let changedFiles = 0;
  let isMergeable = true;

  try {
    const repoPath = getRepoPath(repository.fullName);

    const diff = await git.walk({
      fs,
      dir: repoPath,
      trees: [
        git.TREE({ ref: targetBranchDoc.latestCommitSha }),
        git.TREE({ ref: sourceBranchDoc.latestCommitSha }),
      ],
      map: async (filepath, [targetEntry, sourceEntry]) => {
        if (filepath === ".") return;

        const targetOid = targetEntry ? await targetEntry.oid() : null;
        const sourceOid = sourceEntry ? await sourceEntry.oid() : null;

        if (targetOid === sourceOid) return;

        changedFiles++;
        return { filepath, targetOid, sourceOid };
      },
    });

    changedFiles = diff.filter(Boolean).length;
  } catch {
    isMergeable = false;
  }

  if (linkedIssues && linkedIssues.length > 0) {
    const validIssues = await Issue.find({
      _id: { $in: linkedIssues },
      repository: repository._id,
    }).select("_id");

    if (validIssues.length !== linkedIssues.length) {
      throw new ApiError(400, "One or more linked issues are invalid");
    }
  }

  const pullRequest = await PullRequest.create({
    title,
    body: body || "",
    sourceBranch,
    targetBranch,
    isDraft: isDraft ?? false,
    assignees: assignees || [],
    requestedReviewers: requestedReviewers || [],
    labels: labels || [],
    linkedIssues: linkedIssues || [],
    repository: repository._id,
    author: author._id,
    status: PR_STATUS.OPEN,
    headCommitSha: sourceBranchDoc.latestCommitSha,
    baseCommitSha: targetBranchDoc.latestCommitSha,
    additions,
    deletions,
    changedFiles,
    isMergeable,
  });

  await Repository.findByIdAndUpdate(repository._id, {
    $inc: { openPullRequestsCount: 1 },
  });

  await pullRequest.populate([
    { path: "author", select: "username displayName avatarUrl" },
    { path: "assignees", select: "username displayName avatarUrl" },
    { path: "requestedReviewers", select: "username displayName avatarUrl" },
  ]);

   await notifyPROpened({ pullRequest, repository, actor: author._id });

   if (requestedReviewers && requestedReviewers.length > 0) {
     await notifyPRReviewRequested({
       pullRequest,
       repository,
       actor: author._id,
       reviewers: requestedReviewers,
     });
   }

  return pullRequest;
};

const getPullRequests = async (repository, query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const filter = { repository: repository._id };

  if (query.status && Object.values(PR_STATUS).includes(query.status)) {
    filter.status = query.status;
  } else {
    filter.status = PR_STATUS.OPEN;
  }

  if (query.author) {
    const authorUser = await User.findOne({ username: query.author });
    if (authorUser) filter.author = authorUser._id;
  }

  if (query.assignee) {
    const assigneeUser = await User.findOne({ username: query.assignee });
    if (assigneeUser) filter.assignees = assigneeUser._id;
  }

  if (query.reviewer) {
    const reviewerUser = await User.findOne({ username: query.reviewer });
    if (reviewerUser) filter.requestedReviewers = reviewerUser._id;
  }

  if (query.label) {
    filter["labels.name"] = query.label;
  }

  if (query.isDraft !== undefined) {
    filter.isDraft = query.isDraft === "true";
  }

  if (query.q) {
    filter.$text = { $search: query.q };
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    updated: { updatedAt: -1 },
    comments: { commentsCount: -1 },
  };

  const sort = sortOptions[query.sort] || { createdAt: -1 };

  const [pullRequests, total] = await Promise.all([
    PullRequest.find(filter)
      .populate("author", "username displayName avatarUrl")
      .populate("assignees", "username displayName avatarUrl")
      .populate("requestedReviewers", "username displayName avatarUrl")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    PullRequest.countDocuments(filter),
  ]);

  const pagination = buildPaginationMeta(page, limit, total);

  return { pullRequests, pagination };
};

const getPullRequestByNumber = async (repository, prNumber) => {
  const pullRequest = await PullRequest.findOne({
    repository: repository._id,
    number: parseInt(prNumber, 10),
  })
    .populate("author", "username displayName avatarUrl")
    .populate("assignees", "username displayName avatarUrl")
    .populate("requestedReviewers", "username displayName avatarUrl")
    .populate("mergedBy", "username displayName avatarUrl")
    .populate("closedBy", "username displayName avatarUrl")
    .populate("linkedIssues", "number title status")
    .populate("reviews.reviewer", "username displayName avatarUrl")
    .populate("reviews.comments.author", "username displayName avatarUrl")
    .populate("reviews.comments.resolvedBy", "username displayName avatarUrl");

  if (!pullRequest) {
    throw new ApiError(404, `Pull request #${prNumber} not found`);
  }

  return pullRequest;
};

const getPullRequestDiff = async (repository, prNumber) => {
  const pullRequest = await getPullRequestByNumber(repository, prNumber);
  const repoPath = getRepoPath(repository.fullName);

  let diff = [];

  try {
    const diffResult = await git.walk({
      fs,
      dir: repoPath,
      trees: [
        git.TREE({ ref: pullRequest.baseCommitSha }),
        git.TREE({ ref: pullRequest.headCommitSha }),
      ],
      map: async (filepath, [baseEntry, headEntry]) => {
        if (filepath === ".") return;

        const baseOid = baseEntry ? await baseEntry.oid() : null;
        const headOid = headEntry ? await headEntry.oid() : null;

        if (baseOid === headOid) return;

        let status = "modified";
        if (!baseOid) status = "added";
        if (!headOid) status = "deleted";

        let baseContent = null;
        let headContent = null;

        if (baseOid) {
          const blob = await git.readBlob({ fs, dir: repoPath, oid: baseOid });
          baseContent = Buffer.from(blob.blob).toString("utf-8");
        }

        if (headOid) {
          const blob = await git.readBlob({ fs, dir: repoPath, oid: headOid });
          headContent = Buffer.from(blob.blob).toString("utf-8");
        }

        return {
          path: filepath,
          status,
          baseOid,
          headOid,
          baseContent,
          headContent,
        };
      },
    });

    diff = diffResult.filter(Boolean);
  } catch (error) {
    throw new ApiError(500, `Failed to generate diff: ${error.message}`);
  }

  return { pullRequest, diff };
};

const updatePullRequest = async (pullRequest, updates, requestingUser) => {
  const isAuthor =
    pullRequest.author._id.toString() === requestingUser._id.toString();

  if (!isAuthor) {
    const restrictedFields = ["title", "body", "sourceBranch", "targetBranch"];
    const hasRestricted = Object.keys(updates).some((f) =>
      restrictedFields.includes(f),
    );
    if (hasRestricted) {
      throw new ApiError(
        403,
        "Only the pull request author can edit title and body",
      );
    }
  }

  const allowedFields = [
    "title",
    "body",
    "status",
    "isDraft",
    "assignees",
    "requestedReviewers",
    "labels",
    "isLocked",
    "linkedIssues",
  ];

  const sanitizedUpdates = {};
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      sanitizedUpdates[field] = updates[field];
    }
  });

  const wasOpen = pullRequest.status === PR_STATUS.OPEN;
  const isClosing = updates.status === PR_STATUS.CLOSED;
  const isReopening = updates.status === PR_STATUS.OPEN;

  if (isClosing && wasOpen) {
    sanitizedUpdates.closedAt = new Date();
    sanitizedUpdates.closedBy = requestingUser._id;
    await Repository.findByIdAndUpdate(pullRequest.repository, {
      $inc: { openPullRequestsCount: -1 },
    });
  }

  if (isReopening && !wasOpen) {
    sanitizedUpdates.closedAt = null;
    sanitizedUpdates.closedBy = null;
    await Repository.findByIdAndUpdate(pullRequest.repository, {
      $inc: { openPullRequestsCount: 1 },
    });
  }

  const updatedPR = await PullRequest.findByIdAndUpdate(
    pullRequest._id,
    { $set: sanitizedUpdates },
    { new: true, runValidators: true },
  )
    .populate("author", "username displayName avatarUrl")
    .populate("assignees", "username displayName avatarUrl")
    .populate("requestedReviewers", "username displayName avatarUrl")
    .populate("mergedBy", "username displayName avatarUrl")
    .populate("closedBy", "username displayName avatarUrl");

  return updatedPR;
};

const mergePullRequest = async (pullRequest, repository, requestingUser) => {
  if (pullRequest.status !== PR_STATUS.OPEN) {
    throw new ApiError(
      400,
      `Cannot merge a pull request that is ${pullRequest.status}`,
    );
  }

  if (pullRequest.isDraft) {
    throw new ApiError(400, "Cannot merge a draft pull request");
  }

  if (!pullRequest.isMergeable) {
    throw new ApiError(
      409,
      "This pull request has merge conflicts and cannot be merged",
    );
  }

  const repoPath = getRepoPath(repository.fullName);

  try {
    await git.checkout({ fs, dir: repoPath, ref: pullRequest.targetBranch });

    await git.merge({
      fs,
      dir: repoPath,
      ours: pullRequest.targetBranch,
      theirs: pullRequest.sourceBranch,
      author: {
        name: requestingUser.displayName || requestingUser.username,
        email: requestingUser.email,
      },
      message: `Merge pull request #${pullRequest.number}: ${pullRequest.title}`,
    });

    const mergeCommitSha = await git.resolveRef({
      fs,
      dir: repoPath,
      ref: pullRequest.targetBranch,
    });

    await Branch.findOneAndUpdate(
      { repository: repository._id, name: pullRequest.targetBranch },
      {
        latestCommitSha: mergeCommitSha,
      },
    );

    const updatedPR = await PullRequest.findByIdAndUpdate(
      pullRequest._id,
      {
        $set: {
          status: PR_STATUS.MERGED,
          mergedAt: new Date(),
          mergedBy: requestingUser._id,
          mergeCommitSha,
          closedAt: new Date(),
        },
      },
      { new: true },
    )
      .populate("author", "username displayName avatarUrl")
      .populate("mergedBy", "username displayName avatarUrl");

    await Repository.findByIdAndUpdate(repository._id, {
      $inc: { openPullRequestsCount: -1 },
      lastPushedAt: new Date(),
    });

    if (pullRequest.linkedIssues && pullRequest.linkedIssues.length > 0) {
      await Issue.updateMany(
        {
          _id: { $in: pullRequest.linkedIssues },
          status: ISSUE_STATUS.OPEN,
        },
        {
          $set: {
            status: ISSUE_STATUS.CLOSED,
            closedAt: new Date(),
            closedBy: requestingUser._id,
          },
        },
      );

      await Repository.findByIdAndUpdate(repository._id, {
        $inc: { openIssuesCount: -pullRequest.linkedIssues.length },
      });
    }

    await notifyPRMerged({
      pullRequest,
      repository,
      actor: requestingUser._id,
    });

    return updatedPR;
  } catch (error) {
    if (
      error.code === "MergeNotSupportedFail" ||
      error.code === "MergeConflictError"
    ) {
      await PullRequest.findByIdAndUpdate(pullRequest._id, {
        $set: { isMergeable: false },
      });
      throw new ApiError(
        409,
        "Merge conflict detected. Please resolve conflicts before merging.",
      );
    }
    throw new ApiError(500, `Merge failed: ${error.message}`);
  }
};

const submitReview = async (pullRequest, reviewData, reviewer) => {
  if (pullRequest.status !== PR_STATUS.OPEN) {
    throw new ApiError(400, "Cannot review a closed or merged pull request");
  }

  const isAuthor =
    pullRequest.author._id.toString() === reviewer._id.toString();

  if (isAuthor) {
    throw new ApiError(400, "You cannot review your own pull request");
  }

  const existingReviewIndex = pullRequest.reviews.findIndex(
    (r) => r.reviewer._id.toString() === reviewer._id.toString(),
  );

  const reviewPayload = {
    reviewer: reviewer._id,
    state: reviewData.state,
    body: reviewData.body || "",
    submittedAt: new Date(),
    comments: (reviewData.comments || []).map((c) => ({
      author: reviewer._id,
      body: c.body,
      path: c.path,
      line: c.line || null,
      side: c.side || "RIGHT",
      commitSha: c.commitSha || pullRequest.headCommitSha,
    })),
  };

  let updatedPR;

  if (existingReviewIndex !== -1) {
    updatedPR = await PullRequest.findByIdAndUpdate(
      pullRequest._id,
      {
        $set: {
          [`reviews.${existingReviewIndex}`]: reviewPayload,
        },
      },
      { new: true },
    );
  } else {
    updatedPR = await PullRequest.findByIdAndUpdate(
      pullRequest._id,
      { $push: { reviews: reviewPayload } },
      { new: true },
    );
  }

  await updatedPR.populate([
    { path: "author", select: "username displayName avatarUrl" },
    { path: "reviews.reviewer", select: "username displayName avatarUrl" },
    {
      path: "reviews.comments.author",
      select: "username displayName avatarUrl",
    },
  ]);

  await notifyPRReviewed({
    pullRequest,
    repository: { _id: pullRequest.repository },
    actor: reviewer._id,
    reviewState: reviewData.state,
  });

  return updatedPR;
};

const resolveReviewComment = async (
  pullRequest,
  reviewId,
  commentId,
  requestingUser,
) => {
  const review = pullRequest.reviews.id(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  const comment = review.comments.id(commentId);

  if (!comment) {
    throw new ApiError(404, "Review comment not found");
  }

  const updatedPR = await PullRequest.findOneAndUpdate(
    {
      _id: pullRequest._id,
      "reviews._id": reviewId,
      "reviews.comments._id": commentId,
    },
    {
      $set: {
        "reviews.$[review].comments.$[comment].isResolved": true,
        "reviews.$[review].comments.$[comment].resolvedBy": requestingUser._id,
      },
    },
    {
      arrayFilters: [{ "review._id": reviewId }, { "comment._id": commentId }],
      new: true,
    },
  ).populate("reviews.reviewer", "username displayName avatarUrl");

  return updatedPR;
};

const getPRComments = async (pullRequest, query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const filter = { parent: pullRequest._id, parentType: "PullRequest" };

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

const addPRComment = async ({ body, pullRequest, author }) => {
  if (pullRequest.isLocked) {
    throw new ApiError(
      403,
      "This pull request is locked. Comments are disabled.",
    );
  }

  const comment = await Comment.create({
    body,
    author: author._id,
    repository: pullRequest.repository,
    parentType: "PullRequest",
    parent: pullRequest._id,
  });

  await PullRequest.findByIdAndUpdate(pullRequest._id, {
    $inc: { commentsCount: 1 },
  });

  await comment.populate("author", "username displayName avatarUrl");

  return comment;
};

const updatePRComment = async (commentId, body, requestingUser) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.author.toString() !== requestingUser._id.toString()) {
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

const deletePRComment = async (commentId, requestingUser) => {
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

  await PullRequest.findByIdAndUpdate(comment.parent, {
    $inc: { commentsCount: -1 },
  });

  return { message: "Comment deleted successfully" };
};

export {
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
};
