import api from "./api.js";

const getCommits = async (owner, repoName, params) => {
  const response = await api.get(`/repositories/${owner}/${repoName}/commits`, {
    params,
  });
  return response.data;
};

const getCommit = async (owner, repoName, sha) => {
  const response = await api.get(
    `/repositories/${owner}/${repoName}/commits/${sha}`,
  );
  return response.data;
};

const createCommit = async (owner, repoName, data) => {
  const response = await api.post(
    `/repositories/${owner}/${repoName}/commits`,
    data,
  );
  return response.data;
};

export { getCommits, getCommit, createCommit };
