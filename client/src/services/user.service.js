import api from "./api.js";

const getUserProfile = async (username) => {
  const response = await api.get(`/users/${username}`);
  return response.data;
};

const updateProfile = async (data) => {
  const response = await api.patch("/users/profile", data);
  return response.data;
};

const uploadAvatar = async (formData) => {
  const response = await api.patch("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

const followUser = async (username) => {
  const response = await api.post(`/users/${username}/follow`);
  return response.data;
};

const unfollowUser = async (username) => {
  const response = await api.delete(`/users/${username}/follow`);
  return response.data;
};

const getUserFollowers = async (username, params) => {
  const response = await api.get(`/users/${username}/followers`, { params });
  return response.data;
};

const getUserFollowing = async (username, params) => {
  const response = await api.get(`/users/${username}/following`, { params });
  return response.data;
};

const searchUsers = async (params) => {
  const response = await api.get("/users/search", { params });
  return response.data;
};

export {
  getUserProfile,
  updateProfile,
  uploadAvatar,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  searchUsers,
};
