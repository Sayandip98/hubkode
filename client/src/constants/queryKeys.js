const QUERY_KEYS = {
  AUTH: {
    ME: ["auth", "me"],
  },

  USERS: {
    ALL: ["users"],
    PROFILE: (username) => ["users", username],
    FOLLOWERS: (username) => ["users", username, "followers"],
    FOLLOWING: (username) => ["users", username, "following"],
    REPOSITORIES: (username) => ["users", username, "repositories"],
    SEARCH: (query) => ["users", "search", query],
  },

  REPOSITORIES: {
    ALL: ["repositories"],
    DETAIL: (owner, repoName) => ["repositories", owner, repoName],
    USER_REPOS: (username) => ["repositories", "user", username],
    COLLABORATORS: (owner, repoName) => [
      "repositories",
      owner,
      repoName,
      "collaborators",
    ],
    SEARCH: (query) => ["repositories", "search", query],
    EXPLORE: (filters) => ["repositories", "explore", filters],
  },

  BRANCHES: {
    ALL: (owner, repoName) => ["branches", owner, repoName],
    DETAIL: (owner, repoName, branch) => ["branches", owner, repoName, branch],
  },

  COMMITS: {
    ALL: (owner, repoName, branch) => ["commits", owner, repoName, branch],
    DETAIL: (owner, repoName, sha) => ["commits", owner, repoName, sha],
  },

  FILES: {
    TREE: (owner, repoName, branch, path) => [
      "files",
      "tree",
      owner,
      repoName,
      branch,
      path,
    ],
    BLOB: (owner, repoName, branch, path) => [
      "files",
      "blob",
      owner,
      repoName,
      branch,
      path,
    ],
  },

  ISSUES: {
    ALL: (owner, repoName, filters) => ["issues", owner, repoName, filters],
    DETAIL: (owner, repoName, number) => ["issues", owner, repoName, number],
    COMMENTS: (owner, repoName, number) => [
      "issues",
      owner,
      repoName,
      number,
      "comments",
    ],
    SEARCH: (query) => ["issues", "search", query],
  },

  PULL_REQUESTS: {
    ALL: (owner, repoName, filters) => [
      "pull-requests",
      owner,
      repoName,
      filters,
    ],
    DETAIL: (owner, repoName, number) => [
      "pull-requests",
      owner,
      repoName,
      number,
    ],
    DIFF: (owner, repoName, number) => [
      "pull-requests",
      owner,
      repoName,
      number,
      "diff",
    ],
    COMMENTS: (owner, repoName, number) => [
      "pull-requests",
      owner,
      repoName,
      number,
      "comments",
    ],
    SEARCH: (query) => ["pull-requests", "search", query],
  },

  ORGANIZATIONS: {
    ALL: ["organizations"],
    DETAIL: (orgName) => ["organizations", orgName],
    MEMBERS: (orgName) => ["organizations", orgName, "members"],
    REPOSITORIES: (orgName) => ["organizations", orgName, "repositories"],
    MY_ORGS: ["organizations", "my"],
  },

  NOTIFICATIONS: {
    ALL: (filters) => ["notifications", filters],
    UNREAD_COUNT: ["notifications", "unread-count"],
  },

  SEARCH: {
    GLOBAL: (query) => ["search", "global", query],
    REPOSITORIES: (query, filters) => [
      "search",
      "repositories",
      query,
      filters,
    ],
    USERS: (query) => ["search", "users", query],
    ISSUES: (query, filters) => ["search", "issues", query, filters],
    PULL_REQUESTS: (query, filters) => [
      "search",
      "pull-requests",
      query,
      filters,
    ],
    ORGANIZATIONS: (query) => ["search", "organizations", query],
  },

  AI: {
    REPO_HEALTH: (owner, repoName) => ["ai", "health", owner, repoName],
    ISSUE_SUMMARY: (owner, repoName, number) => [
      "ai",
      "issue-summary",
      owner,
      repoName,
      number,
    ],
    PR_SUMMARY: (owner, repoName, number) => [
      "ai",
      "pr-summary",
      owner,
      repoName,
      number,
    ],
    LABEL_SUGGESTIONS: (owner, repoName, number) => [
      "ai",
      "label-suggestions",
      owner,
      repoName,
      number,
    ],
  },
};

export default QUERY_KEYS;
