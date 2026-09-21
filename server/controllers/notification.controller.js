import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
} from "../services/notification.service.js";

const list = asyncHandler(async (req, res) => {
  const { notifications, pagination, unreadCount } = await getNotifications(
    req.user._id,
    req.query,
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { notifications, unreadCount },
        "Notifications fetched successfully",
        pagination,
      ),
    );
});

const getCount = asyncHandler(async (req, res) => {
  const { count } = await getUnreadCount(req.user._id);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { count },
        "Unread notification count fetched successfully",
      ),
    );
});

const readOne = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await markAsRead(notificationId, req.user._id);

  res
    .status(200)
    .json(
      new ApiResponse(200, { notification }, "Notification marked as read"),
    );
});

const readAll = asyncHandler(async (req, res) => {
  const result = await markAllAsRead(req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, { count: result.count }, result.message));
});

const removeOne = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const result = await deleteNotification(notificationId, req.user._id);

  res.status(200).json(new ApiResponse(200, null, result.message));
});

const removeAll = asyncHandler(async (req, res) => {
  const result = await deleteAllNotifications(req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, { count: result.count }, result.message));
});

export { list, getCount, readOne, readAll, removeOne, removeAll };
