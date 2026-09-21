import { body } from "express-validator";

const createBranchValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Branch name is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Branch name must be between 1 and 255 characters")
    .matches(/^[a-zA-Z0-9._/-]+$/)
    .withMessage("Branch name contains invalid characters"),

  body("sourceBranch")
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Source branch name must be between 1 and 255 characters"),
];

export { createBranchValidator };
