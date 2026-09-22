import { Router } from "express";
import {
  repositories,
  users,
  issues,
  pullRequests,
  organizations,
  global,
  explore,
} from "../controllers/search.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", optionalAuth, global);

router.get("/repositories", optionalAuth, repositories);

router.get("/users", users);

router.get("/issues", optionalAuth, issues);

router.get("/pull-requests", optionalAuth, pullRequests);

router.get("/organizations", organizations);

router.get("/explore", optionalAuth, explore);

export default router;
