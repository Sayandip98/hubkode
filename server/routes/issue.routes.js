import { Router } from "express";
import {
  create,
  list,
  getOne,
  update,
  remove,
  listComments,
  addComment,
  editComment,
  removeComment,
  toggleReaction,
} from "../controllers/issue.controller.js";
import { protect, optionalAuth } from "../middleware/auth.middleware.js";
import { requireRepoPermission } from "../middleware/role.middleware.js";
import validate from "../middleware/validation.middleware.js";
import {
  createIssueValidator,
  updateIssueValidator,
  createCommentValidator,
  updateCommentValidator,
} from "../validators/issue.validator.js";

const router = Router({ mergeParams: true });

router.get("/", optionalAuth, requireRepoPermission("read"), list);

router.post(
  "/",
  protect,
  requireRepoPermission("read"),
  createIssueValidator,
  validate,
  create,
);

router.get(
  "/:issueNumber",
  optionalAuth,
  requireRepoPermission("read"),
  getOne,
);

router.patch(
  "/:issueNumber",
  protect,
  requireRepoPermission("read"),
  updateIssueValidator,
  validate,
  update,
);

router.delete("/:issueNumber", protect, requireRepoPermission("read"), remove);

router.get(
  "/:issueNumber/comments",
  optionalAuth,
  requireRepoPermission("read"),
  listComments,
);

router.post(
  "/:issueNumber/comments",
  protect,
  requireRepoPermission("read"),
  createCommentValidator,
  validate,
  addComment,
);

router.patch(
  "/:issueNumber/comments/:commentId",
  protect,
  requireRepoPermission("read"),
  updateCommentValidator,
  validate,
  editComment,
);

router.delete(
  "/:issueNumber/comments/:commentId",
  protect,
  requireRepoPermission("read"),
  removeComment,
);

router.post(
  "/:issueNumber/comments/:commentId/reactions",
  protect,
  requireRepoPermission("read"),
  toggleReaction,
);

export default router;
