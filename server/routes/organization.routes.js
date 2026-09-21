import { Router } from "express";
import {
  create,
  getOne,
  update,
  remove,
  listMembers,
  addMember,
  changeMemberRole,
  kickMember,
  listRepositories,
  createRepository,
  getUserOrgs,
} from "../controllers/organization.controller.js";
import { protect, optionalAuth } from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";
import {
  createOrganizationValidator,
  updateOrganizationValidator,
  inviteMemberValidator,
  updateMemberRoleValidator,
} from "../validators/organization.validator.js";

const router = Router();

router.get("/my", protect, getUserOrgs);

router.post("/", protect, createOrganizationValidator, validate, create);

router.get("/:orgName", optionalAuth, getOne);

router.patch(
  "/:orgName",
  protect,
  updateOrganizationValidator,
  validate,
  update,
);

router.delete("/:orgName", protect, remove);

router.get("/:orgName/members", optionalAuth, listMembers);

router.post(
  "/:orgName/members",
  protect,
  inviteMemberValidator,
  validate,
  addMember,
);

router.patch(
  "/:orgName/members/:memberId/role",
  protect,
  updateMemberRoleValidator,
  validate,
  changeMemberRole,
);

router.delete("/:orgName/members/:memberId", protect, kickMember);

router.get("/:orgName/repositories", optionalAuth, listRepositories);

router.post("/:orgName/repositories", protect, createRepository);

export default router;
