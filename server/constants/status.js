const ISSUE_STATUS = {
  OPEN: "open",
  CLOSED: "closed",
};

const PR_STATUS = {
  OPEN: "open",
  CLOSED: "closed",
  MERGED: "merged",
  DRAFT: "draft",
};

const REVIEW_STATE = {
  PENDING: "pending",
  APPROVED: "approved",
  CHANGES_REQUESTED: "changes_requested",
  COMMENTED: "commented",
  DISMISSED: "dismissed",
};

const NOTIFICATION_TYPES = {
  ISSUE_OPENED: "issue_opened",
  ISSUE_CLOSED: "issue_closed",
  ISSUE_COMMENT: "issue_comment",
  ISSUE_ASSIGNED: "issue_assigned",
  PR_OPENED: "pr_opened",
  PR_CLOSED: "pr_closed",
  PR_MERGED: "pr_merged",
  PR_REVIEW_REQUESTED: "pr_review_requested",
  PR_REVIEWED: "pr_reviewed",
  PR_COMMENT: "pr_comment",
  COMMIT_PUSHED: "commit_pushed",
  REPO_STARRED: "repo_starred",
  REPO_FORKED: "repo_forked",
  USER_FOLLOWED: "user_followed",
  COLLABORATOR_ADDED: "collaborator_added",
  ORG_INVITATION: "org_invitation",
};

const NOTIFICATION_READ_STATUS = {
  UNREAD: "unread",
  READ: "read",
};

export {
  ISSUE_STATUS,
  PR_STATUS,
  REVIEW_STATE,
  NOTIFICATION_TYPES,
  NOTIFICATION_READ_STATUS,
};
