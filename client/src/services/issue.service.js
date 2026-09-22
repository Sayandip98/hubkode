import api from "./api.js";

const getIssues = async (owner, repoName, params) => {
  const response = await api.get(`/repositories/${owner}/${repoName}/issues`, {
    params,
  });
  return response.data;
};

const getIssue = async (owner, repoName, issueNumber) => {
  const response = await api.get(
    `/repositories/${owner}/${repoName}/issues/${issueNumber}`,
  );
  return response.data;
};

const createIssue = async (owner, repoName, data) => {
  const response = await api.post(
    `/repositories/${owner}/${repoName}/issues`,
    data,
  );
  return response.data;
};

const updateIssue = async (owner, repoName, issueNumber, data) => {
  const response = await api.patch(
    `/repositories/${owner}/${repoName}/issues/${issueNumber}`,
    data,
  );
  return response.data;
};

const deleteIssue = async (owner, repoName, issueNumber) => {
  const response = await api.delete(
    `/repositories/${owner}/${repoName}/issues/${issueNumber}`,
  );
  return response.data;
};

const getIssueComments = async (owner, repoName, issueNumber, params) => {
  const response = await api.get(
    `/repositories/${owner}/${repoName}/issues/${issueNumber}/comments`,
    { params },
  );
  return response.data;
};

const addIssueComment = async (owner, repoName, issueNumber, data) => {
  const response = await api.post(
    `/repositories/${owner}/${repoName}/issues/${issueNumber}/comments`,
    data,
  );
  return response.data;
};

const updateIssueComment = async (
  owner,
  repoName,
  issueNumber,
  commentId,
  data,
) => {
  const response = await api.patch(
    `/repositories/${owner}/${repoName}/issues/${issueNumber}/comments/${commentId}`,
    data,
  );
  return response.data;
};

const deleteIssueComment = async (owner, repoName, issueNumber, commentId) => {
  const response = await api.delete(
    `/repositories/${owner}/${repoName}/issues/${issueNumber}/comments/${commentId}`,
  );
  return response.data;
};

const toggleReaction = async (
  owner,
  repoName,
  issueNumber,
  commentId,
  emoji,
) => {
  const response = await api.post(
    `/repositories/${owner}/${repoName}/issues/${issueNumber}/comments/${commentId}/reactions`,
    { emoji },
  );
  return response.data;
};

export {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
  getIssueComments,
  addIssueComment,
  updateIssueComment,
  deleteIssueComment,
  toggleReaction,
};
