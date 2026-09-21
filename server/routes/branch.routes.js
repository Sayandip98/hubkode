import { Router } from "express";
import {
  listBranches,
  create,
  remove,
} from "../controllers/branch.controller.js";
import { protect, optionalAuth } from "../middleware/auth.middleware.js";
import { requireRepoPermission } from "../middleware/role.middleware.js";
import validate from "../middleware/validation.middleware.js";
import { createBranchValidator } from "../validators/branch.validator.js";

const router = Router({ mergeParams: true });

router.get("/", optionalAuth, requireRepoPermission("read"), listBranches);

router.post(
  "/",
  protect,
  requireRepoPermission("write"),
  createBranchValidator,
  validate,
  create,
);

router.delete("/:branch", protect, requireRepoPermission("write"), remove);

export default router;
