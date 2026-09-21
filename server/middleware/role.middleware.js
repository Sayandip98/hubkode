import Repository from "../models/Repository.js";
import { ApiError } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { APP_ROLES } from "../constants/roles.js";
import { hasPermission } from "../constants/permissions.js";

const requireRole = (...roles) => {
  const allowedRoles = roles.flat();

  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required.");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        "You do not have permission to perform this action.",
      );
    }

    next();
  });
};

const requireRepoPermission = (requiredPermission) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required.");
    }

    const { owner, repoName } = req.params;

    if (!owner || !repoName) {
      throw new ApiError(
        400,
        "Repository owner and name are required in the URL.",
      );
    }

    const repository = await Repository.findOne({
      fullName: `${owner}/${repoName}`,
    })
      .populate("owner", "username")
      .populate("collaborators.user", "username");

    if (!repository) {
      throw new ApiError(404, "Repository not found.");
    }

    const userId = req.user._id.toString();

    if (repository.owner._id.toString() === userId) {
      req.repository = repository;
      req.userRepoPermission = "admin";
      return next();
    }

    const collaborator = repository.collaborators.find(
      (collab) => collab.user._id.toString() === userId,
    );

    if (collaborator) {
      if (hasPermission(collaborator.permission, requiredPermission)) {
        req.repository = repository;
        req.userRepoPermission = collaborator.permission;
        return next();
      }

      throw new ApiError(
        403,
        `You need ${requiredPermission} permission to perform this action.`,
      );
    }

    if (!repository.isPrivate && requiredPermission === "read") {
      req.repository = repository;
      req.userRepoPermission = "read";
      return next();
    }

    if (repository.isPrivate) {
      throw new ApiError(
        404,
        "Repository not found.",
      );
    }

    throw new ApiError(
      403,
      "You do not have permission to perform this action.",
    );
  });
};

export { requireRole, requireRepoPermission };
