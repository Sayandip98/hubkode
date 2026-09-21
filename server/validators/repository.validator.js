import { body, param } from "express-validator";

/**
 * createRepositoryValidator
 *
 * Validates POST /api/v1/repositories
 */
const createRepositoryValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Repository name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Repository name must be between 1 and 100 characters")
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage(
      "Repository name can only contain alphanumeric characters, hyphens, underscores, and dots",
    ),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("isPrivate")
    .optional()
    .isBoolean()
    .withMessage("isPrivate must be a boolean value")
    .toBoolean(),

  body("hasIssues")
    .optional()
    .isBoolean()
    .withMessage("hasIssues must be a boolean value")
    .toBoolean(),

  body("hasWiki")
    .optional()
    .isBoolean()
    .withMessage("hasWiki must be a boolean value")
    .toBoolean(),

  body("website")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Website URL cannot exceed 255 characters")
    .custom((value) => {
      if (value && value.length > 0) {
        const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
        if (!urlPattern.test(value)) {
          throw new Error("Please provide a valid URL");
        }
      }
      return true;
    }),

  body("topics")
    .optional()
    .isArray({ max: 20 })
    .withMessage("Topics must be an array with a maximum of 20 items"),

  body("topics.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Each topic must be between 1 and 50 characters")
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage("Topics can only contain alphanumeric characters and hyphens"),

  body("autoInit")
    .optional()
    .isBoolean()
    .withMessage("autoInit must be a boolean value")
    .toBoolean(),
];

/**
 * updateRepositoryValidator
 *
 * Validates PATCH /api/v1/repositories/:owner/:repoName
 */
const updateRepositoryValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Repository name must be between 1 and 100 characters")
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage(
      "Repository name can only contain alphanumeric characters, hyphens, underscores, and dots",
    ),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("isPrivate")
    .optional()
    .isBoolean()
    .withMessage("isPrivate must be a boolean value")
    .toBoolean(),

  body("website")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Website URL cannot exceed 255 characters")
    .custom((value) => {
      if (value && value.length > 0) {
        const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
        if (!urlPattern.test(value)) {
          throw new Error("Please provide a valid URL");
        }
      }
      return true;
    }),

  body("defaultBranch")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Branch name must be between 1 and 100 characters"),

  body("hasIssues")
    .optional()
    .isBoolean()
    .withMessage("hasIssues must be a boolean value")
    .toBoolean(),

  body("hasWiki")
    .optional()
    .isBoolean()
    .withMessage("hasWiki must be a boolean value")
    .toBoolean(),

  body("hasDiscussions")
    .optional()
    .isBoolean()
    .withMessage("hasDiscussions must be a boolean value")
    .toBoolean(),

  body("topics")
    .optional()
    .isArray({ max: 20 })
    .withMessage("Topics must be an array with a maximum of 20 items"),

  body("topics.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Each topic must be between 1 and 50 characters")
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage("Topics can only contain alphanumeric characters and hyphens"),
];

/**
 * addCollaboratorValidator
 *
 * Validates POST /api/v1/repositories/:owner/:repoName/collaborators
 */
const addCollaboratorValidator = [
  body("username").trim().notEmpty().withMessage("Username is required"),

  body("permission")
    .optional()
    .isIn(["read", "write", "admin"])
    .withMessage("Permission must be read, write, or admin"),
];

/**
 * updateCollaboratorValidator
 *
 * Validates PATCH /api/v1/repositories/:owner/:repoName/collaborators/:userId
 */
const updateCollaboratorValidator = [
  body("permission")
    .notEmpty()
    .withMessage("Permission is required")
    .isIn(["read", "write", "admin"])
    .withMessage("Permission must be read, write, or admin"),
];

export {
  createRepositoryValidator,
  updateRepositoryValidator,
  addCollaboratorValidator,
  updateCollaboratorValidator,
};
