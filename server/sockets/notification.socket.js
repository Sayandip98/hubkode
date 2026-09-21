import logger from "../utils/logger.js";

const registerNotificationSocket = (io, socket) => {
  socket.on("notification:join", (userId) => {
    if (!userId) return;

    socket.join(`user:${userId}`);
    logger.info(`Socket ${socket.id} joined notification room: user:${userId}`);
  });

  socket.on("notification:leave", (userId) => {
    if (!userId) return;

    socket.leave(`user:${userId}`);
    logger.info(`Socket ${socket.id} left notification room: user:${userId}`);
  });
};

const emitNotification = (io, userId, notification) => {
  io.to(`user:${userId}`).emit("notification:new", notification);
};

const emitUnreadCount = (io, userId, count) => {
  io.to(`user:${userId}`).emit("notification:unread_count", { count });
};

export { registerNotificationSocket, emitNotification, emitUnreadCount };
