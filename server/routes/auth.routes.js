import { Router } from "express";
import {
  register,
  login,
  logout,
  getMe,
  updatePassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";
import {
  registerValidator,
  loginValidator,
  changePasswordValidator,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.patch(
  "/change-password",
  protect,
  changePasswordValidator,
  validate,
  updatePassword,
);

export default router;
