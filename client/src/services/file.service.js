import api from "./api.js";

const getFileTree = async (owner, repoName, branch, path = "") => {
  const encodedPath = path ? encodeURIComponent(path) : "";
  const url = encodedPath
    ? `/repositories/${owner}/${repoName}/tree/${branch}/${encodedPath}`
    : `/repositories/${owner}/${repoName}/tree/${branch}`;

  const response = await api.get(url);
  return response.data;
};

const getFileContent = async (owner, repoName, branch, path) => {
  const encodedPath = encodeURIComponent(path);
  const response = await api.get(
    `/repositories/${owner}/${repoName}/blob/${branch}/${encodedPath}`,
  );
  return response.data;
};

export { getFileTree, getFileContent };
