import api from "./api.js";

const getNotifications = async (params) => {
  const response = await api.get("/notifications", { params });
  return response.data;
};

const getUnreadCount = async () => {
  const response = await api.get("/notifications/unread-count");
  return response.data;
};

const markAsRead = async (notificationId) => {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

const markAllAsRead = async () => {
  const response = await api.patch("/notifications/read-all");
  return response.data;
};

const deleteNotification = async (notificationId) => {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data;
};

const deleteAllNotifications = async () => {
  const response = await api.delete("/notifications");
  return response.data;
};

export {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};
