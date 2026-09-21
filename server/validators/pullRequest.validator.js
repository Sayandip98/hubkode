import { body } from "express-validator";

const createPullRequestValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Pull request title is required")
    .isLength({ min: 1, max: 500 })
    .withMessage("Title must be between 1 and 500 characters"),

  body("body")
    .optional()
    .trim()
    .isLength({ max: 65536 })
    .withMessage("Body cannot exceed 65536 characters"),

  body("sourceBranch")
    .trim()
    .notEmpty()
    .withMessage("Source branch is required"),

  body("targetBranch")
    .trim()
    .notEmpty()
    .withMessage("Target branch is required")
    .custom((value, { req }) => {
      if (value === req.body.sourceBranch) {
        throw new Error("Source and target branches must be different");
      }
      return true;
    }),

  body("isDraft")
    .optional()
    .isBoolean()
    .withMessage("isDraft must be a boolean")
    .toBoolean(),

  body("assignees")
    .optional()
    .isArray()
    .withMessage("Assignees must be an array"),

  body("assignees.*")
    .optional()
    .isMongoId()
    .withMessage("Each assignee must be a valid user ID"),

  body("requestedReviewers")
    .optional()
    .isArray()
    .withMessage("Requested reviewers must be an array"),

  body("requestedReviewers.*")
    .optional()
    .isMongoId()
    .withMessage("Each reviewer must be a valid user ID"),

  body("labels").optional().isArray().withMessage("Labels must be an array"),

  body("linkedIssues")
    .optional()
    .isArray()
    .withMessage("Linked issues must be an array"),

  body("linkedIssues.*")
    .optional()
    .isMongoId()
    .withMessage("Each linked issue must be a valid ID"),
];

const updatePullRequestValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Title must be between 1 and 500 characters"),

  body("body")
    .optional()
    .trim()
    .isLength({ max: 65536 })
    .withMessage("Body cannot exceed 65536 characters"),

  body("status")
    .optional()
    .isIn(["open", "closed"])
    .withMessage("Status must be open or closed"),

  body("isDraft")
    .optional()
    .isBoolean()
    .withMessage("isDraft must be a boolean")
    .toBoolean(),

  body("assignees")
    .optional()
    .isArray()
    .withMessage("Assignees must be an array"),

  body("requestedReviewers")
    .optional()
    .isArray()
    .withMessage("Requested reviewers must be an array"),

  body("labels").optional().isArray().withMessage("Labels must be an array"),

  body("isLocked")
    .optional()
    .isBoolean()
    .withMessage("isLocked must be a boolean")
    .toBoolean(),
];

const submitReviewValidator = [
  body("state")
    .notEmpty()
    .withMessage("Review state is required")
    .isIn(["approved", "changes_requested", "commented"])
    .withMessage(
      "Review state must be approved, changes_requested, or commented",
    ),

  body("body")
    .optional()
    .trim()
    .isLength({ max: 65536 })
    .withMessage("Review body cannot exceed 65536 characters"),

  body("comments")
    .optional()
    .isArray()
    .withMessage("Comments must be an array"),

  body("comments.*.path")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Comment file path is required"),

  body("comments.*.body")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Comment body is required")
    .isLength({ max: 65536 })
    .withMessage("Comment body cannot exceed 65536 characters"),

  body("comments.*.line")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Comment line must be a positive integer"),
];

const reviewCommentValidator = [
  body("body")
    .trim()
    .notEmpty()
    .withMessage("Comment body is required")
    .isLength({ min: 1, max: 65536 })
    .withMessage("Comment cannot exceed 65536 characters"),

  body("path").trim().notEmpty().withMessage("File path is required"),

  body("line")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Line must be a positive integer"),

  body("side")
    .optional()
    .isIn(["LEFT", "RIGHT"])
    .withMessage("Side must be LEFT or RIGHT"),

  body("commitSha").optional().trim(),
];

export {
  createPullRequestValidator,
  updatePullRequestValidator,
  submitReviewValidator,
  reviewCommentValidator,
};
