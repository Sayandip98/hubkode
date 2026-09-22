import api from "./api.js";

const explainCode = async (data) => {
  const response = await api.post("/ai/explain", data);
  return response.data;
};

const reviewCode = async (data) => {
  const response = await api.post("/ai/review", data);
  return response.data;
};

const explainFile = async (owner, repoName, branch, path) => {
  const response = await api.get(
    `/ai/repositories/${owner}/${repoName}/files/${branch}/${path}/explain`,
  );
  return response.data;
};

const reviewFile = async (owner, repoName, branch, path, data) => {
  const response = await api.post(
    `/ai/repositories/${owner}/${repoName}/files/${branch}/${path}/review`,
    data,
  );
  return response.data;
};

const summarizeIssue = async (owner, repoName, issueNumber) => {
  const response = await api.get(
    `/ai/repositories/${owner}/${repoName}/issues/${issueNumber}/summarize`,
  );
  return response.data;
};

const summarizePR = async (owner, repoName, prNumber) => {
  const response = await api.get(
    `/ai/repositories/${owner}/${repoName}/pull-requests/${prNumber}/summarize`,
  );
  return response.data;
};

const generateCommitMessage = async (data) => {
  const response = await api.post("/ai/commit-message", data);
  return response.data;
};

const analyzeRepoHealth = async (owner, repoName) => {
  const response = await api.get(
    `/ai/repositories/${owner}/${repoName}/health`,
  );
  return response.data;
};

const suggestLabels = async (owner, repoName, issueNumber) => {
  const response = await api.get(
    `/ai/repositories/${owner}/${repoName}/issues/${issueNumber}/suggest-labels`,
  );
  return response.data;
};

const generatePRDescription = async (owner, repoName, data) => {
  const response = await api.post(
    `/ai/repositories/${owner}/${repoName}/pull-requests/generate-description`,
    data,
  );
  return response.data;
};

export {
  explainCode,
  reviewCode,
  explainFile,
  reviewFile,
  summarizeIssue,
  summarizePR,
  generateCommitMessage,
  analyzeRepoHealth,
  suggestLabels,
  generatePRDescription,
};
