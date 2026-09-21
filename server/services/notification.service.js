import Notification from "../models/Notification.js";
import { ApiError } from "../utils/apiResponse.js";
import {
  getPaginationParams,
  buildPaginationMeta,
} from "../utils/pagination.js";
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_READ_STATUS,
} from "../constants/status.js";

const createNotification = async ({
  recipient,
  actor,
  type,
  resourceType,
  resource,
  repository,
  message,
  metadata,
}) => {
  if (recipient.toString() === actor.toString()) {
    return null;
  }

  const notification = await Notification.create({
    recipient,
    actor,
    type,
    resourceType,
    resource,
    repository: repository || null,
    message: message || "",
    metadata: metadata || {},
    readStatus: NOTIFICATION_READ_STATUS.UNREAD,
  });

  return notification;
};

const createBulkNotifications = async (notifications) => {
  const filtered = notifications.filter(
    (n) => n.recipient.toString() !== n.actor.toString(),
  );

  if (filtered.length === 0) return [];

  const created = await Notification.insertMany(filtered);
  return created;
};

const getNotifications = async (userId, query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const filter = { recipient: userId };

  if (query.status === NOTIFICATION_READ_STATUS.UNREAD) {
    filter.readStatus = NOTIFICATION_READ_STATUS.UNREAD;
  }

  if (query.status === NOTIFICATION_READ_STATUS.READ) {
    filter.readStatus = NOTIFICATION_READ_STATUS.READ;
  }

  if (query.type && Object.values(NOTIFICATION_TYPES).includes(query.type)) {
    filter.type = query.type;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate("actor", "username displayName avatarUrl")
      .populate("repository", "name fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({
      recipient: userId,
      readStatus: NOTIFICATION_READ_STATUS.UNREAD,
    }),
  ]);

  const pagination = buildPaginationMeta(page, limit, total);

  return { notifications, pagination, unreadCount };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.recipient.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only mark your own notifications as read");
  }

  if (notification.readStatus === NOTIFICATION_READ_STATUS.READ) {
    return notification;
  }

  const updated = await Notification.findByIdAndUpdate(
    notificationId,
    { $set: { readStatus: NOTIFICATION_READ_STATUS.READ } },
    { new: true },
  ).populate("actor", "username displayName avatarUrl");

  return updated;
};

const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    {
      recipient: userId,
      readStatus: NOTIFICATION_READ_STATUS.UNREAD,
    },
    { $set: { readStatus: NOTIFICATION_READ_STATUS.READ } },
  );

  return {
    message: "All notifications marked as read",
    count: result.modifiedCount,
  };
};

const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.recipient.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only delete your own notifications");
  }

  await Notification.findByIdAndDelete(notificationId);

  return { message: "Notification deleted successfully" };
};

const deleteAllNotifications = async (userId) => {
  const result = await Notification.deleteMany({ recipient: userId });

  return {
    message: "All notifications deleted successfully",
    count: result.deletedCount,
  };
};

const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({
    recipient: userId,
    readStatus: NOTIFICATION_READ_STATUS.UNREAD,
  });

  return { count };
};

const notifyIssueOpened = async ({ issue, repository, actor }) => {
  if (repository.watchers && repository.watchers.length > 0) {
    const notifications = repository.watchers
      .filter((watcherId) => watcherId.toString() !== actor.toString())
      .map((watcherId) => ({
        recipient: watcherId,
        actor,
        type: NOTIFICATION_TYPES.ISSUE_OPENED,
        resourceType: "Issue",
        resource: issue._id,
        repository: repository._id,
        message: `opened issue #${issue.number}: ${issue.title}`,
        metadata: { issueNumber: issue.number, issueTitle: issue.title },
      }));

    await createBulkNotifications(notifications);
  }
};

const notifyIssueClosed = async ({ issue, repository, actor }) => {
  const recipients = new Set();

  if (issue.author.toString() !== actor.toString()) {
    recipients.add(issue.author.toString());
  }

  issue.assignees.forEach((assigneeId) => {
    if (assigneeId.toString() !== actor.toString()) {
      recipients.add(assigneeId.toString());
    }
  });

  const notifications = [...recipients].map((recipientId) => ({
    recipient: recipientId,
    actor,
    type: NOTIFICATION_TYPES.ISSUE_CLOSED,
    resourceType: "Issue",
    resource: issue._id,
    repository: repository._id,
    message: `closed issue #${issue.number}: ${issue.title}`,
    metadata: { issueNumber: issue.number, issueTitle: issue.title },
  }));

  await createBulkNotifications(notifications);
};

const notifyIssueComment = async ({ comment, issue, repository, actor }) => {
  const recipients = new Set();

  if (issue.author.toString() !== actor.toString()) {
    recipients.add(issue.author.toString());
  }

  issue.assignees.forEach((assigneeId) => {
    if (assigneeId.toString() !== actor.toString()) {
      recipients.add(assigneeId.toString());
    }
  });

  const notifications = [...recipients].map((recipientId) => ({
    recipient: recipientId,
    actor,
    type: NOTIFICATION_TYPES.ISSUE_COMMENT,
    resourceType: "Issue",
    resource: issue._id,
    repository: repository._id,
    message: `commented on issue #${issue.number}: ${issue.title}`,
    metadata: {
      issueNumber: issue.number,
      issueTitle: issue.title,
      commentId: comment._id,
    },
  }));

  await createBulkNotifications(notifications);
};

const notifyPROpened = async ({ pullRequest, repository, actor }) => {
  if (repository.watchers && repository.watchers.length > 0) {
    const notifications = repository.watchers
      .filter((watcherId) => watcherId.toString() !== actor.toString())
      .map((watcherId) => ({
        recipient: watcherId,
        actor,
        type: NOTIFICATION_TYPES.PR_OPENED,
        resourceType: "PullRequest",
        resource: pullRequest._id,
        repository: repository._id,
        message: `opened pull request #${pullRequest.number}: ${pullRequest.title}`,
        metadata: {
          prNumber: pullRequest.number,
          prTitle: pullRequest.title,
        },
      }));

    await createBulkNotifications(notifications);
  }
};

const notifyPRMerged = async ({ pullRequest, repository, actor }) => {
  const recipients = new Set();

  if (pullRequest.author.toString() !== actor.toString()) {
    recipients.add(pullRequest.author.toString());
  }

  pullRequest.requestedReviewers.forEach((reviewerId) => {
    if (reviewerId.toString() !== actor.toString()) {
      recipients.add(reviewerId.toString());
    }
  });

  const notifications = [...recipients].map((recipientId) => ({
    recipient: recipientId,
    actor,
    type: NOTIFICATION_TYPES.PR_MERGED,
    resourceType: "PullRequest",
    resource: pullRequest._id,
    repository: repository._id,
    message: `merged pull request #${pullRequest.number}: ${pullRequest.title}`,
    metadata: {
      prNumber: pullRequest.number,
      prTitle: pullRequest.title,
    },
  }));

  await createBulkNotifications(notifications);
};

const notifyPRReviewRequested = async ({
  pullRequest,
  repository,
  actor,
  reviewers,
}) => {
  const notifications = reviewers
    .filter((reviewerId) => reviewerId.toString() !== actor.toString())
    .map((reviewerId) => ({
      recipient: reviewerId,
      actor,
      type: NOTIFICATION_TYPES.PR_REVIEW_REQUESTED,
      resourceType: "PullRequest",
      resource: pullRequest._id,
      repository: repository._id,
      message: `requested your review on pull request #${pullRequest.number}: ${pullRequest.title}`,
      metadata: {
        prNumber: pullRequest.number,
        prTitle: pullRequest.title,
      },
    }));

  await createBulkNotifications(notifications);
};

const notifyPRReviewed = async ({
  pullRequest,
  repository,
  actor,
  reviewState,
}) => {
  if (pullRequest.author.toString() === actor.toString()) return;

  await createNotification({
    recipient: pullRequest.author,
    actor,
    type: NOTIFICATION_TYPES.PR_REVIEWED,
    resourceType: "PullRequest",
    resource: pullRequest._id,
    repository: repository._id,
    message: `reviewed your pull request #${pullRequest.number}: ${pullRequest.title}`,
    metadata: {
      prNumber: pullRequest.number,
      prTitle: pullRequest.title,
      reviewState,
    },
  });
};

const notifyRepoStarred = async ({ repository, actor }) => {
  await createNotification({
    recipient: repository.owner,
    actor,
    type: NOTIFICATION_TYPES.REPO_STARRED,
    resourceType: "Repository",
    resource: repository._id,
    repository: repository._id,
    message: `starred your repository ${repository.fullName}`,
    metadata: { repoName: repository.fullName },
  });
};

const notifyRepoForked = async ({ repository, fork, actor }) => {
  await createNotification({
    recipient: repository.owner,
    actor,
    type: NOTIFICATION_TYPES.REPO_FORKED,
    resourceType: "Repository",
    resource: fork._id,
    repository: repository._id,
    message: `forked your repository ${repository.fullName}`,
    metadata: {
      repoName: repository.fullName,
      forkName: fork.fullName,
    },
  });
};

const notifyUserFollowed = async ({ targetUser, actor }) => {
  await createNotification({
    recipient: targetUser._id,
    actor,
    type: NOTIFICATION_TYPES.USER_FOLLOWED,
    resourceType: "User",
    resource: actor,
    message: `started following you`,
    metadata: {},
  });
};

const notifyCollaboratorAdded = async ({
  repository,
  collaboratorId,
  actor,
}) => {
  await createNotification({
    recipient: collaboratorId,
    actor,
    type: NOTIFICATION_TYPES.COLLABORATOR_ADDED,
    resourceType: "Repository",
    resource: repository._id,
    repository: repository._id,
    message: `added you as a collaborator on ${repository.fullName}`,
    metadata: { repoName: repository.fullName },
  });
};

export {
  createNotification,
  createBulkNotifications,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  notifyIssueOpened,
  notifyIssueClosed,
  notifyIssueComment,
  notifyPROpened,
  notifyPRMerged,
  notifyPRReviewRequested,
  notifyPRReviewed,
  notifyRepoStarred,
  notifyRepoForked,
  notifyUserFollowed,
  notifyCollaboratorAdded,
};
