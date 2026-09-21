import { Router } from "express";
import {
  listCommits,
  getCommit,
  create,
} from "../controllers/commit.controller.js";
import { protect, optionalAuth } from "../middleware/auth.middleware.js";
import { requireRepoPermission } from "../middleware/role.middleware.js";
import validate from "../middleware/validation.middleware.js";
import { createCommitValidator } from "../validators/commit.validator.js";

const router = Router({ mergeParams: true });

router.get("/", optionalAuth, requireRepoPermission("read"), listCommits);

router.get("/:sha", optionalAuth, requireRepoPermission("read"), getCommit);

router.post(
  "/",
  protect,
  requireRepoPermission("write"),
  createCommitValidator,
  validate,
  create,
);

export default router;
