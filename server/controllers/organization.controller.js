import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse, ApiError } from "../utils/apiResponse.js";
import Organization from "../models/Organization.js";
import {
  createOrganization,
  getOrganizationByName,
  updateOrganization,
  deleteOrganization,
  getOrganizationMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  getOrganizationRepositories,
  createOrgRepository,
  getUserOrganizations,
} from "../services/organization.service.js";
import { ORG_ROLES } from "../constants/roles.js";

const resolveOrganization = async (orgName) => {
  const organization = await Organization.findOne({ name: orgName }).populate(
    "members.user",
    "username displayName avatarUrl",
  );

  if (!organization) {
    throw new ApiError(404, `Organization "${orgName}" not found`);
  }

  return organization;
};

const requireOrgOwner = (organization, userId) => {
  if (!organization.isOwner(userId)) {
    throw new ApiError(403, "Only organization owners can perform this action");
  }
};

const requireOrgMember = (organization, userId) => {
  if (!organization.isMember(userId)) {
    throw new ApiError(
      403,
      "You must be a member of this organization to perform this action",
    );
  }
};

const create = asyncHandler(async (req, res) => {
  const { name, displayName, description, website, location, email } = req.body;

  const organization = await createOrganization({
    name,
    displayName,
    description,
    website,
    location,
    email,
    creator: req.user,
  });

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { organization },
        "Organization created successfully",
      ),
    );
});

const getOne = asyncHandler(async (req, res) => {
  const { orgName } = req.params;
  const requesterId = req.user?._id || null;

  const { organization, isMember, memberRole } = await getOrganizationByName(
    orgName,
    requesterId,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { organization, isMember, memberRole },
        "Organization fetched successfully",
      ),
    );
});

const update = asyncHandler(async (req, res) => {
  const { orgName } = req.params;

  const organization = await resolveOrganization(orgName);
  requireOrgOwner(organization, req.user._id);

  const updatedOrg = await updateOrganization(organization, req.body);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { organization: updatedOrg },
        "Organization updated successfully",
      ),
    );
});

const remove = asyncHandler(async (req, res) => {
  const { orgName } = req.params;

  const organization = await resolveOrganization(orgName);
  requireOrgOwner(organization, req.user._id);

  const result = await deleteOrganization(organization);

  res.status(200).json(new ApiResponse(200, null, result.message));
});

const listMembers = asyncHandler(async (req, res) => {
  const { orgName } = req.params;

  const organization = await resolveOrganization(orgName);

  const { members, pagination } = await getOrganizationMembers(
    organization,
    req.query,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { members },
        "Members fetched successfully",
        pagination,
      ),
    );
});

const addMember = asyncHandler(async (req, res) => {
  const { orgName } = req.params;
  const { username, role } = req.body;

  const organization = await resolveOrganization(orgName);
  requireOrgOwner(organization, req.user._id);

  const result = await inviteMember(organization, username, role);

  res
    .status(201)
    .json(new ApiResponse(201, { member: result.member }, result.message));
});

const changeMemberRole = asyncHandler(async (req, res) => {
  const { orgName, memberId } = req.params;
  const { role } = req.body;

  const organization = await resolveOrganization(orgName);
  requireOrgOwner(organization, req.user._id);

  const result = await updateMemberRole(organization, memberId, role, req.user);

  res.status(200).json(new ApiResponse(200, null, result.message));
});

const kickMember = asyncHandler(async (req, res) => {
  const { orgName, memberId } = req.params;

  const organization = await resolveOrganization(orgName);

  const result = await removeMember(organization, memberId, req.user);

  res.status(200).json(new ApiResponse(200, null, result.message));
});

const listRepositories = asyncHandler(async (req, res) => {
  const { orgName } = req.params;
  const requesterId = req.user?._id || null;

  const organization = await resolveOrganization(orgName);

  const { repositories, pagination } = await getOrganizationRepositories(
    organization,
    requesterId,
    req.query,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { repositories },
        "Organization repositories fetched successfully",
        pagination,
      ),
    );
});

const createRepository = asyncHandler(async (req, res) => {
  const { orgName } = req.params;
  const { name, description, isPrivate, hasIssues, hasWiki, website, topics } =
    req.body;

  const organization = await resolveOrganization(orgName);
  requireOrgMember(organization, req.user._id);

  const repository = await createOrgRepository({
    name,
    description,
    isPrivate,
    hasIssues,
    hasWiki,
    website,
    topics,
    organization,
    creator: req.user,
  });

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { repository },
        "Organization repository created successfully",
      ),
    );
});

const getUserOrgs = asyncHandler(async (req, res) => {
  const { organizations, pagination } = await getUserOrganizations(
    req.user._id,
    req.query,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { organizations },
        "Organizations fetched successfully",
        pagination,
      ),
    );
});

export {
  create,
  getOne,
  update,
  remove,
  listMembers,
  addMember,
  changeMemberRole,
  kickMember,
  listRepositories,
  createRepository,
  getUserOrgs,
};
