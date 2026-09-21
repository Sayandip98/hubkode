import { Router } from "express";
import {
  list,
  getCount,
  readOne,
  readAll,
  removeOne,
  removeAll,
} from "../controllers/notification.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protect, list);

router.get("/unread-count", protect, getCount);

router.patch("/read-all", protect, readAll);

router.delete("/", protect, removeAll);

router.patch("/:notificationId/read", protect, readOne);

router.delete("/:notificationId", protect, removeOne);

export default router;
