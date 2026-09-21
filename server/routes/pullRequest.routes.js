import { Router } from "express";
import {
  create,
  list,
  getOne,
  getDiff,
  update,
  merge,
  review,
  resolveComment,
  listComments,
  addComment,
  editComment,
  removeComment,
} from "../controllers/pullRequest.controller.js";
import { protect, optionalAuth } from "../middleware/auth.middleware.js";
import { requireRepoPermission } from "../middleware/role.middleware.js";
import validate from "../middleware/validation.middleware.js";
import {
  createPullRequestValidator,
  updatePullRequestValidator,
  submitReviewValidator,
  reviewCommentValidator,
} from "../validators/pullRequest.validator.js";

const router = Router({ mergeParams: true });

router.get("/", optionalAuth, requireRepoPermission("read"), list);

router.post(
  "/",
  protect,
  requireRepoPermission("read"),
  createPullRequestValidator,
  validate,
  create,
);

router.get("/:prNumber", optionalAuth, requireRepoPermission("read"), getOne);

router.get(
  "/:prNumber/diff",
  optionalAuth,
  requireRepoPermission("read"),
  getDiff,
);

router.patch(
  "/:prNumber",
  protect,
  requireRepoPermission("read"),
  updatePullRequestValidator,
  validate,
  update,
);

router.post("/:prNumber/merge", protect, requireRepoPermission("write"), merge);

router.post(
  "/:prNumber/reviews",
  protect,
  requireRepoPermission("read"),
  submitReviewValidator,
  validate,
  review,
);

router.patch(
  "/:prNumber/reviews/:reviewId/comments/:commentId/resolve",
  protect,
  requireRepoPermission("read"),
  resolveComment,
);

router.get(
  "/:prNumber/comments",
  optionalAuth,
  requireRepoPermission("read"),
  listComments,
);

router.post(
  "/:prNumber/comments",
  protect,
  requireRepoPermission("read"),
  reviewCommentValidator,
  validate,
  addComment,
);

router.patch(
  "/:prNumber/comments/:commentId",
  protect,
  requireRepoPermission("read"),
  reviewCommentValidator,
  validate,
  editComment,
);

router.delete(
  "/:prNumber/comments/:commentId",
  protect,
  requireRepoPermission("read"),
  removeComment,
);

export default router;
