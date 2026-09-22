import { Router } from "express";
import {
  explain,
  review,
  explainFile,
  reviewFile,
  summarizeIssueById,
  summarizePRById,
  generateCommit,
  repoHealth,
  suggestLabels,
  generatePRDesc,
} from "../controllers/ai.controller.js";
import { protect, optionalAuth } from "../middleware/auth.middleware.js";
import { body } from "express-validator";
import validate from "../middleware/validation.middleware.js";

const router = Router();

const explainValidator = [
  body("code")
    .notEmpty()
    .withMessage("Code content is required")
    .isLength({ max: 50000 })
    .withMessage("Code cannot exceed 50,000 characters"),
  body("language").optional().trim(),
  body("filename").optional().trim(),
];

const reviewValidator = [
  body("code")
    .notEmpty()
    .withMessage("Code content is required")
    .isLength({ max: 50000 })
    .withMessage("Code cannot exceed 50,000 characters"),
  body("language").optional().trim(),
  body("filename").optional().trim(),
  body("context").optional().trim(),
];

const commitMessageValidator = [
  body("diff")
    .isArray({ min: 1 })
    .withMessage("Diff array with at least one entry is required"),
  body("context").optional().trim(),
];

const prDescValidator = [
  body("sourceBranch")
    .trim()
    .notEmpty()
    .withMessage("Source branch is required"),
  body("targetBranch")
    .trim()
    .notEmpty()
    .withMessage("Target branch is required"),
];

router.post("/explain", protect, explainValidator, validate, explain);

router.post("/review", protect, reviewValidator, validate, review);

router.get(
  "/repositories/:owner/:repoName/files/:branch/{*path}/explain",
  protect,
  explainFile,
);

router.post(
  "/repositories/:owner/:repoName/files/:branch/{*path}/review",
  protect,
  reviewFile,
);

router.get(
  "/repositories/:owner/:repoName/issues/:issueNumber/summarize",
  protect,
  summarizeIssueById,
);

router.get(
  "/repositories/:owner/:repoName/pull-requests/:prNumber/summarize",
  protect,
  summarizePRById,
);

router.post(
  "/commit-message",
  protect,
  commitMessageValidator,
  validate,
  generateCommit,
);

router.get("/repositories/:owner/:repoName/health", optionalAuth, repoHealth);

router.get(
  "/repositories/:owner/:repoName/issues/:issueNumber/suggest-labels",
  protect,
  suggestLabels,
);

router.post(
  "/repositories/:owner/:repoName/pull-requests/generate-description",
  protect,
  prDescValidator,
  validate,
  generatePRDesc,
);

export default router;
