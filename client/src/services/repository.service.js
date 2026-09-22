import api from "./api.js";

const createRepository = async (data) => {
  const response = await api.post("/repositories", data);
  return response.data;
};

const getRepository = async (owner, repoName) => {
  const response = await api.get(`/repositories/${owner}/${repoName}`);
  return response.data;
};

const getUserRepositories = async (username, params) => {
  const response = await api.get(`/repositories/user/${username}`, { params });
  return response.data;
};

const updateRepository = async (owner, repoName, data) => {
  const response = await api.patch(`/repositories/${owner}/${repoName}`, data);
  return response.data;
};

const deleteRepository = async (owner, repoName) => {
  const response = await api.delete(`/repositories/${owner}/${repoName}`);
  return response.data;
};

const starRepository = async (owner, repoName) => {
  const response = await api.post(`/repositories/${owner}/${repoName}/star`);
  return response.data;
};

const unstarRepository = async (owner, repoName) => {
  const response = await api.delete(`/repositories/${owner}/${repoName}/star`);
  return response.data;
};

const watchRepository = async (owner, repoName) => {
  const response = await api.post(`/repositories/${owner}/${repoName}/watch`);
  return response.data;
};

const unwatchRepository = async (owner, repoName) => {
  const response = await api.delete(`/repositories/${owner}/${repoName}/watch`);
  return response.data;
};

const forkRepository = async (owner, repoName) => {
  const response = await api.post(`/repositories/${owner}/${repoName}/fork`);
  return response.data;
};

const getCollaborators = async (owner, repoName, params) => {
  const response = await api.get(
    `/repositories/${owner}/${repoName}/collaborators`,
    { params },
  );
  return response.data;
};

const addCollaborator = async (owner, repoName, data) => {
  const response = await api.post(
    `/repositories/${owner}/${repoName}/collaborators`,
    data,
  );
  return response.data;
};

const updateCollaborator = async (owner, repoName, userId, data) => {
  const response = await api.patch(
    `/repositories/${owner}/${repoName}/collaborators/${userId}`,
    data,
  );
  return response.data;
};

const removeCollaborator = async (owner, repoName, userId) => {
  const response = await api.delete(
    `/repositories/${owner}/${repoName}/collaborators/${userId}`,
  );
  return response.data;
};

export {
  createRepository,
  getRepository,
  getUserRepositories,
  updateRepository,
  deleteRepository,
  starRepository,
  unstarRepository,
  watchRepository,
  unwatchRepository,
  forkRepository,
  getCollaborators,
  addCollaborator,
  updateCollaborator,
  removeCollaborator,
};
