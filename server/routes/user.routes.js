import { Router } from "express";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  follow,
  unfollow,
  getFollowers,
  getFollowing,
  search,
} from "../controllers/user.controller.js";
import { protect, optionalAuth } from "../middleware/auth.middleware.js";
import {
  uploadAvatar as uploadAvatarMiddleware,
  handleMulterError,
} from "../middleware/upload.middleware.js";
import validate from "../middleware/validation.middleware.js";
import { updateProfileValidator } from "../validators/user.validator.js";

const router = Router();

router.get("/search", search);
router.get("/:username", optionalAuth, getProfile);
router.patch(
  "/profile",
  protect,
  updateProfileValidator,
  validate,
  updateProfile,
);
router.patch(
  "/avatar",
  protect,
  uploadAvatarMiddleware,
  handleMulterError,
  uploadAvatar,
);
router.get("/:username/followers", getFollowers);
router.get("/:username/following", getFollowing);
router.post("/:username/follow", protect, follow);
router.delete("/:username/follow", protect, unfollow);

export default router;
