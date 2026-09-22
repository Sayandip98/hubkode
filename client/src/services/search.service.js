import api from "./api.js";

const globalSearch = async (params) => {
  const response = await api.get("/search", { params });
  return response.data;
};

const searchRepositories = async (params) => {
  const response = await api.get("/search/repositories", { params });
  return response.data;
};

const searchUsers = async (params) => {
  const response = await api.get("/search/users", { params });
  return response.data;
};

const searchIssues = async (params) => {
  const response = await api.get("/search/issues", { params });
  return response.data;
};

const searchPullRequests = async (params) => {
  const response = await api.get("/search/pull-requests", { params });
  return response.data;
};

const searchOrganizations = async (params) => {
  const response = await api.get("/search/organizations", { params });
  return response.data;
};

const getExploreRepositories = async (params) => {
  const response = await api.get("/search/explore", { params });
  return response.data;
};

export {
  globalSearch,
  searchRepositories,
  searchUsers,
  searchIssues,
  searchPullRequests,
  searchOrganizations,
  getExploreRepositories,
};
