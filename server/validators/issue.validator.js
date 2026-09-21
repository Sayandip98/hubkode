import { body } from "express-validator";

const createIssueValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Issue title is required")
    .isLength({ min: 1, max: 500 })
    .withMessage("Issue title must be between 1 and 500 characters"),

  body("body")
    .optional()
    .trim()
    .isLength({ max: 65536 })
    .withMessage("Issue body cannot exceed 65536 characters"),

  body("assignees")
    .optional()
    .isArray()
    .withMessage("Assignees must be an array"),

  body("assignees.*")
    .optional()
    .isMongoId()
    .withMessage("Each assignee must be a valid user ID"),

  body("labels").optional().isArray().withMessage("Labels must be an array"),

  body("labels.*.name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Label name is required")
    .isLength({ max: 50 })
    .withMessage("Label name cannot exceed 50 characters"),

  body("labels.*.color")
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage("Label color must be a valid hex color code"),
];

const updateIssueValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Issue title must be between 1 and 500 characters"),

  body("body")
    .optional()
    .trim()
    .isLength({ max: 65536 })
    .withMessage("Issue body cannot exceed 65536 characters"),

  body("status")
    .optional()
    .isIn(["open", "closed"])
    .withMessage("Status must be open or closed"),

  body("assignees")
    .optional()
    .isArray()
    .withMessage("Assignees must be an array"),

  body("assignees.*")
    .optional()
    .isMongoId()
    .withMessage("Each assignee must be a valid user ID"),

  body("labels").optional().isArray().withMessage("Labels must be an array"),

  body("isPinned")
    .optional()
    .isBoolean()
    .withMessage("isPinned must be a boolean")
    .toBoolean(),

  body("isLocked")
    .optional()
    .isBoolean()
    .withMessage("isLocked must be a boolean")
    .toBoolean(),
];

const createCommentValidator = [
  body("body")
    .trim()
    .notEmpty()
    .withMessage("Comment body is required")
    .isLength({ min: 1, max: 65536 })
    .withMessage("Comment cannot exceed 65536 characters"),
];

const updateCommentValidator = [
  body("body")
    .trim()
    .notEmpty()
    .withMessage("Comment body is required")
    .isLength({ min: 1, max: 65536 })
    .withMessage("Comment cannot exceed 65536 characters"),
];

export {
  createIssueValidator,
  updateIssueValidator,
  createCommentValidator,
  updateCommentValidator,
};
