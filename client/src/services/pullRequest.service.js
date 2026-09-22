import api from "./api.js";

const getPullRequests = async (owner, repoName, params) => {
  const response = await api.get(
    `/repositories/${owner}/${repoName}/pull-requests`,
    { params },
  );
  return response.data;
};

const getPullRequest = async (owner, repoName, prNumber) => {
  const response = await api.get(
    `/repositories/${owner}/${repoName}/pull-requests/${prNumber}`,
  );
  return response.data;
};

const getPullRequestDiff = async (owner, repoName, prNumber) => {
  const response = await api.get(
    `/repositories/${owner}/${repoName}/pull-requests/${prNumber}/diff`,
  );
  return response.data;
};

const createPullRequest = async (owner, repoName, data) => {
  const response = await api.post(
    `/repositories/${owner}/${repoName}/pull-requests`,
    data,
  );
  return response.data;
};

const updatePullRequest = async (owner, repoName, prNumber, data) => {
  const response = await api.patch(
    `/repositories/${owner}/${repoName}/pull-requests/${prNumber}`,
    data,
  );
  return response.data;
};

const mergePullRequest = async (owner, repoName, prNumber) => {
  const response = await api.post(
    `/repositories/${owner}/${repoName}/pull-requests/${prNumber}/merge`,
  );
  return response.data;
};

const submitReview = async (owner, repoName, prNumber, data) => {
  const response = await api.post(
    `/repositories/${owner}/${repoName}/pull-requests/${prNumber}/reviews`,
    data,
  );
  return response.data;
};

const resolveReviewComment = async (
  owner,
  repoName,
  prNumber,
  reviewId,
  commentId,
) => {
  const response = await api.patch(
    `/repositories/${owner}/${repoName}/pull-requests/${prNumber}/reviews/${reviewId}/comments/${commentId}/resolve`,
  );
  return response.data;
};

const getPRComments = async (owner, repoName, prNumber, params) => {
  const response = await api.get(
    `/repositories/${owner}/${repoName}/pull-requests/${prNumber}/comments`,
    { params },
  );
  return response.data;
};

const addPRComment = async (owner, repoName, prNumber, data) => {
  const response = await api.post(
    `/repositories/${owner}/${repoName}/pull-requests/${prNumber}/comments`,
    data,
  );
  return response.data;
};

const updatePRComment = async (owner, repoName, prNumber, commentId, data) => {
  const response = await api.patch(
    `/repositories/${owner}/${repoName}/pull-requests/${prNumber}/comments/${commentId}`,
    data,
  );
  return response.data;
};

const deletePRComment = async (owner, repoName, prNumber, commentId) => {
  const response = await api.delete(
    `/repositories/${owner}/${repoName}/pull-requests/${prNumber}/comments/${commentId}`,
  );
  return response.data;
};

export {
  getPullRequests,
  getPullRequest,
  getPullRequestDiff,
  createPullRequest,
  updatePullRequest,
  mergePullRequest,
  submitReview,
  resolveReviewComment,
  getPRComments,
  addPRComment,
  updatePRComment,
  deletePRComment,
};
