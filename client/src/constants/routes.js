const ROUTES = {
  HOME: "/",

  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
  },

  DASHBOARD: "/dashboard",

  EXPLORE: "/explore",

  NOTIFICATIONS: "/notifications",

  SETTINGS: {
    ROOT: "/settings",
    PROFILE: "/settings/profile",
    SECURITY: "/settings/security",
    APPEARANCE: "/settings/appearance",
  },

  NEW_REPOSITORY: "/new",

  ORGANIZATIONS: {
    NEW: "/organizations/new",
    DETAIL: (orgName) => `/orgs/${orgName}`,
    MEMBERS: (orgName) => `/orgs/${orgName}/people`,
    REPOSITORIES: (orgName) => `/orgs/${orgName}/repositories`,
    SETTINGS: (orgName) => `/orgs/${orgName}/settings`,
  },

  PROFILE: (username) => `/${username}`,

  PROFILE_TAB: (username, tab) => `/${username}?tab=${tab}`,

  REPOSITORY: {
    ROOT: (owner, repoName) => `/${owner}/${repoName}`,

    TREE: (owner, repoName, branch, path = "") =>
      path
        ? `/${owner}/${repoName}/tree/${branch}/${path}`
        : `/${owner}/${repoName}/tree/${branch}`,

    BLOB: (owner, repoName, branch, path) =>
      `/${owner}/${repoName}/blob/${branch}/${path}`,

    COMMITS: (owner, repoName, branch) =>
      `/${owner}/${repoName}/commits/${branch}`,

    COMMIT: (owner, repoName, sha) => `/${owner}/${repoName}/commit/${sha}`,

    ISSUES: (owner, repoName) => `/${owner}/${repoName}/issues`,

    NEW_ISSUE: (owner, repoName) => `/${owner}/${repoName}/issues/new`,

    ISSUE: (owner, repoName, number) =>
      `/${owner}/${repoName}/issues/${number}`,

    PULL_REQUESTS: (owner, repoName) => `/${owner}/${repoName}/pulls`,

    NEW_PR: (owner, repoName) => `/${owner}/${repoName}/pulls/new`,

    PULL_REQUEST: (owner, repoName, number) =>
      `/${owner}/${repoName}/pulls/${number}`,

    PR_FILES: (owner, repoName, number) =>
      `/${owner}/${repoName}/pulls/${number}/files`,

    SETTINGS: (owner, repoName) => `/${owner}/${repoName}/settings`,

    COLLABORATORS: (owner, repoName) =>
      `/${owner}/${repoName}/settings/collaborators`,
  },

  SEARCH: (query, type) =>
    type
      ? `/search?q=${encodeURIComponent(query)}&type=${type}`
      : `/search?q=${encodeURIComponent(query)}`,
};

export default ROUTES;
