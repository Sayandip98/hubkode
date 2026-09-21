import Organization from "../models/Organization.js";
import Repository from "../models/Repository.js";
import User from "../models/User.js";
import { ApiError } from "../utils/apiResponse.js";
import {
  getPaginationParams,
  buildPaginationMeta,
} from "../utils/pagination.js";
import { ORG_ROLES } from "../constants/roles.js";

const createOrganization = async ({
  name,
  displayName,
  description,
  website,
  location,
  email,
  creator,
}) => {
  const existingOrg = await Organization.findOne({ name });

  if (existingOrg) {
    throw new ApiError(409, `Organization "${name}" already exists`);
  }

  const existingUser = await User.findOne({ username: name });

  if (existingUser) {
    throw new ApiError(409, `"${name}" is already taken by a user account`);
  }

  const organization = await Organization.create({
    name,
    displayName: displayName || name,
    description: description || "",
    website: website || "",
    location: location || "",
    email: email || "",
    createdBy: creator._id,
    members: [
      {
        user: creator._id,
        role: ORG_ROLES.OWNER,
        joinedAt: new Date(),
      },
    ],
  });

  await organization.populate("members.user", "username displayName avatarUrl");

  return organization;
};

const getOrganizationByName = async (orgName, requesterId) => {
  const organization = await Organization.findOne({ name: orgName })
    .populate("members.user", "username displayName avatarUrl")
    .populate("createdBy", "username displayName avatarUrl");

  if (!organization) {
    throw new ApiError(404, `Organization "${orgName}" not found`);
  }

  const isMember = requesterId ? organization.isMember(requesterId) : false;

  const memberRole = requesterId
    ? organization.getMemberRole(requesterId)
    : null;

  return { organization, isMember, memberRole };
};

const updateOrganization = async (organization, updates) => {
  const allowedFields = [
    "displayName",
    "description",
    "website",
    "location",
    "email",
  ];

  const sanitizedUpdates = {};
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      sanitizedUpdates[field] = updates[field];
    }
  });

  if (Object.keys(sanitizedUpdates).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  const updatedOrg = await Organization.findByIdAndUpdate(
    organization._id,
    { $set: sanitizedUpdates },
    { new: true, runValidators: true },
  )
    .populate("members.user", "username displayName avatarUrl")
    .populate("createdBy", "username displayName avatarUrl");

  return updatedOrg;
};

const deleteOrganization = async (organization) => {
  await Repository.deleteMany({
    owner: organization._id,
    ownerType: "Organization",
  });

  await Organization.findByIdAndDelete(organization._id);

  return {
    message: `Organization "${organization.name}" deleted successfully`,
  };
};

const getOrganizationMembers = async (organization, query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const total = organization.members.length;

  const populatedOrg = await Organization.findById(organization._id).populate({
    path: "members.user",
    select: "username displayName avatarUrl bio location",
  });

  const members = populatedOrg.members.slice(skip, skip + limit);
  const pagination = buildPaginationMeta(page, limit, total);

  return { members, pagination };
};

const inviteMember = async (
  organization,
  username,
  role = ORG_ROLES.MEMBER,
) => {
  const user = await User.findOne({ username, isActive: true });

  if (!user) {
    throw new ApiError(404, `User "${username}" not found`);
  }

  const alreadyMember = organization.isMember(user._id);

  if (alreadyMember) {
    throw new ApiError(
      409,
      `"${username}" is already a member of this organization`,
    );
  }

  const updatedOrg = await Organization.findByIdAndUpdate(
    organization._id,
    {
      $push: {
        members: {
          user: user._id,
          role,
          joinedAt: new Date(),
        },
      },
    },
    { new: true },
  ).populate("members.user", "username displayName avatarUrl");

  const addedMember = updatedOrg.members.find(
    (m) => m.user._id.toString() === user._id.toString(),
  );

  return {
    message: `"${username}" added to organization successfully`,
    member: addedMember,
  };
};

const updateMemberRole = async (
  organization,
  memberId,
  role,
  requestingUser,
) => {
  const member = organization.members.find(
    (m) =>
      m.user.toString() === memberId || m.user._id?.toString() === memberId,
  );

  if (!member) {
    throw new ApiError(404, "Member not found in this organization");
  }

  if (memberId === requestingUser._id.toString()) {
    throw new ApiError(400, "You cannot change your own role");
  }

  const owners = organization.members.filter((m) => m.role === ORG_ROLES.OWNER);

  if (
    member.role === ORG_ROLES.OWNER &&
    role === ORG_ROLES.MEMBER &&
    owners.length <= 1
  ) {
    throw new ApiError(400, "Cannot demote the last owner of the organization");
  }

  await Organization.findOneAndUpdate(
    {
      _id: organization._id,
      "members.user": memberId,
    },
    { $set: { "members.$.role": role } },
  );

  return { message: "Member role updated successfully" };
};

const removeMember = async (organization, memberId, requestingUser) => {
  const member = organization.members.find(
    (m) =>
      m.user.toString() === memberId || m.user._id?.toString() === memberId,
  );

  if (!member) {
    throw new ApiError(404, "Member not found in this organization");
  }

  const isSelfRemoval = memberId === requestingUser._id.toString();

  if (!isSelfRemoval) {
    const requesterRole = organization.getMemberRole(requestingUser._id);
    if (requesterRole !== ORG_ROLES.OWNER) {
      throw new ApiError(403, "Only organization owners can remove members");
    }
  }

  const owners = organization.members.filter((m) => m.role === ORG_ROLES.OWNER);

  if (member.role === ORG_ROLES.OWNER && owners.length <= 1) {
    throw new ApiError(400, "Cannot remove the last owner of the organization");
  }

  await Organization.findByIdAndUpdate(organization._id, {
    $pull: { members: { user: memberId } },
  });

  return { message: "Member removed from organization successfully" };
};

const getOrganizationRepositories = async (
  organization,
  requesterId,
  query,
) => {
  const { page, limit, skip } = getPaginationParams(query);

  const isMember = requesterId ? organization.isMember(requesterId) : false;

  const filter = {
    owner: organization._id,
    ownerType: "Organization",
  };

  if (!isMember) {
    filter.isPrivate = false;
  }

  if (query.type === "public") filter.isPrivate = false;
  if (query.type === "private" && isMember) filter.isPrivate = true;
  if (query.language) filter.language = query.language;
  if (query.topic) filter.topics = query.topic;

  const sortOptions = {
    updated: { updatedAt: -1 },
    created: { createdAt: -1 },
    pushed: { lastPushedAt: -1 },
    name: { name: 1 },
  };

  const sort = sortOptions[query.sort] || { updatedAt: -1 };

  const [repositories, total] = await Promise.all([
    Repository.find(filter)
      .populate("owner", "name displayName avatarUrl")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Repository.countDocuments(filter),
  ]);

  const pagination = buildPaginationMeta(page, limit, total);

  return { repositories, pagination };
};

const createOrgRepository = async ({
  name,
  description,
  isPrivate,
  hasIssues,
  hasWiki,
  website,
  topics,
  organization,
  creator,
}) => {
  const existingRepo = await Repository.findOne({
    owner: organization._id,
    name: { $regex: new RegExp(`^${name}$`, "i") },
  });

  if (existingRepo) {
    throw new ApiError(
      409,
      `Organization "${organization.name}" already has a repository named "${name}"`,
    );
  }

  const fullName = `${organization.name}/${name}`.toLowerCase();

  const repository = await Repository.create({
    name,
    fullName,
    description: description || "",
    isPrivate: isPrivate ?? false,
    hasIssues: hasIssues ?? true,
    hasWiki: hasWiki ?? true,
    website: website || "",
    topics: topics || [],
    owner: organization._id,
    ownerType: "Organization",
    isInitialized: false,
    defaultBranch: "main",
  });

  return repository;
};

const getUserOrganizations = async (userId, query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const filter = { "members.user": userId };

  const [organizations, total] = await Promise.all([
    Organization.find(filter)
      .populate("createdBy", "username displayName avatarUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Organization.countDocuments(filter),
  ]);

  const pagination = buildPaginationMeta(page, limit, total);

  return { organizations, pagination };
};

export {
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
};
