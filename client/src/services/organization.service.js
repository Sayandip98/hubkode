import api from "./api.js";

const getMyOrganizations = async (params) => {
  const response = await api.get("/organizations/my", { params });
  return response.data;
};

const createOrganization = async (data) => {
  const response = await api.post("/organizations", data);
  return response.data;
};

const getOrganization = async (orgName) => {
  const response = await api.get(`/organizations/${orgName}`);
  return response.data;
};

const updateOrganization = async (orgName, data) => {
  const response = await api.patch(`/organizations/${orgName}`, data);
  return response.data;
};

const deleteOrganization = async (orgName) => {
  const response = await api.delete(`/organizations/${orgName}`);
  return response.data;
};

const getOrganizationMembers = async (orgName, params) => {
  const response = await api.get(`/organizations/${orgName}/members`, {
    params,
  });
  return response.data;
};

const addOrganizationMember = async (orgName, data) => {
  const response = await api.post(`/organizations/${orgName}/members`, data);
  return response.data;
};

const updateMemberRole = async (orgName, memberId, data) => {
  const response = await api.patch(
    `/organizations/${orgName}/members/${memberId}/role`,
    data,
  );
  return response.data;
};

const removeOrganizationMember = async (orgName, memberId) => {
  const response = await api.delete(
    `/organizations/${orgName}/members/${memberId}`,
  );
  return response.data;
};

const getOrganizationRepositories = async (orgName, params) => {
  const response = await api.get(`/organizations/${orgName}/repositories`, {
    params,
  });
  return response.data;
};

const createOrganizationRepository = async (orgName, data) => {
  const response = await api.post(
    `/organizations/${orgName}/repositories`,
    data,
  );
  return response.data;
};

export {
  getMyOrganizations,
  createOrganization,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationMembers,
  addOrganizationMember,
  updateMemberRole,
  removeOrganizationMember,
  getOrganizationRepositories,
  createOrganizationRepository,
};
