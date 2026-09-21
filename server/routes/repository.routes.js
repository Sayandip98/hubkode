import { Router } from "express";
import {
  create,
  getRepository,
  getUserRepos,
  update,
  remove,
  star,
  unstar,
  watch,
  unwatch,
  fork,
  listCollaborators,
  addCollaboratorToRepo,
  updateCollaborator,
  removeCollaboratorFromRepo,
} from "../controllers/repository.controller.js";
import { protect, optionalAuth } from "../middleware/auth.middleware.js";
import { requireRepoPermission } from "../middleware/role.middleware.js";
import validate from "../middleware/validation.middleware.js";
import {
  createRepositoryValidator,
  updateRepositoryValidator,
  addCollaboratorValidator,
  updateCollaboratorValidator,
} from "../validators/repository.validator.js";

const router = Router();

router.post("/", protect, createRepositoryValidator, validate, create);
router.get("/user/:username", optionalAuth, getUserRepos);
router.get("/:owner/:repoName", optionalAuth, getRepository);
router.patch(
  "/:owner/:repoName",
  protect,
  requireRepoPermission("admin"),
  updateRepositoryValidator,
  validate,
  update,
);
router.delete(
  "/:owner/:repoName",
  protect,
  requireRepoPermission("admin"),
  remove,
);
router.post(
  "/:owner/:repoName/star",
  protect,
  requireRepoPermission("read"),
  star,
);
router.delete(
  "/:owner/:repoName/star",
  protect,
  requireRepoPermission("read"),
  unstar,
);
router.post(
  "/:owner/:repoName/watch",
  protect,
  requireRepoPermission("read"),
  watch,
);
router.delete(
  "/:owner/:repoName/watch",
  protect,
  requireRepoPermission("read"),
  unwatch,
);
router.post(
  "/:owner/:repoName/fork",
  protect,
  requireRepoPermission("read"),
  fork,
);
router.get(
  "/:owner/:repoName/collaborators",
  protect,
  requireRepoPermission("read"),
  listCollaborators,
);
router.post(
  "/:owner/:repoName/collaborators",
  protect,
  requireRepoPermission("admin"),
  addCollaboratorValidator,
  validate,
  addCollaboratorToRepo,
);
router.patch(
  "/:owner/:repoName/collaborators/:userId",
  protect,
  requireRepoPermission("admin"),
  updateCollaboratorValidator,
  validate,
  updateCollaborator,
);
router.delete(
  "/:owner/:repoName/collaborators/:userId",
  protect,
  requireRepoPermission("admin"),
  removeCollaboratorFromRepo,
);

export default router;
