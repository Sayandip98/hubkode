import api from "./api.js";

const getBranches = async (owner, repoName) => {
  const response = await api.get(`/repositories/${owner}/${repoName}/branches`);
  return response.data;
};

const createBranch = async (owner, repoName, data) => {
  const response = await api.post(
    `/repositories/${owner}/${repoName}/branches`,
    data,
  );
  return response.data;
};

const deleteBranch = async (owner, repoName, branch) => {
  const response = await api.delete(
    `/repositories/${owner}/${repoName}/branches/${branch}`,
  );
  return response.data;
};

export { getBranches, createBranch, deleteBranch };
