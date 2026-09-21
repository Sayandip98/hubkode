import { body } from "express-validator";

const createCommitValidator = [
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Commit message is required")
    .isLength({ min: 1, max: 2000 })
    .withMessage("Commit message must be between 1 and 2000 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Commit description cannot exceed 5000 characters"),

  body("branch").trim().notEmpty().withMessage("Branch name is required"),

  body("files")
    .isArray({ min: 1 })
    .withMessage("At least one file change is required"),

  body("files.*.path").trim().notEmpty().withMessage("File path is required"),

  body("files.*.action")
    .isIn(["create", "update", "delete"])
    .withMessage("File action must be create, update, or delete"),

  body("files.*.content")
    .optional()
    .isString()
    .withMessage("File content must be a string"),
];

export { createCommitValidator };
