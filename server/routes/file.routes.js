import { Router } from "express";
import { getTree, getFile } from "../controllers/file.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";
import { requireRepoPermission } from "../middleware/role.middleware.js";

const router = Router({ mergeParams: true });

router.get(
  "/tree/:branch/{*path}",
  optionalAuth,
  requireRepoPermission("read"),
  getTree,
);

router.get(
  "/blob/:branch/{*path}",
  optionalAuth,
  requireRepoPermission("read"),
  getFile,
);

export default router;
