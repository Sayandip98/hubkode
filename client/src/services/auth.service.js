import api from "./api.js";

const register = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

const login = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

const changePassword = async (data) => {
  const response = await api.patch("/auth/change-password", data);
  return response.data;
};

export { register, login, logout, getMe, changePassword };
