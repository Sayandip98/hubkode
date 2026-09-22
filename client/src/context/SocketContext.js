import {
  createContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "@store/authStore.js";
import { useSocketStore } from "@store/socketStore.js";
import { useNotificationStore } from "@store/notificationStore.js";

export const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const SocketProvider = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?._id);

  const setSocket = useSocketStore((state) => state.setSocket);
  const clearSocket = useSocketStore((state) => state.clearSocket);

  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const addRecentNotification = useNotificationStore(
    (state) => state.addRecentNotification,
  );

  const [socket, setSocketState] = useState(null);

  const handleConnect = useCallback(
    (newSocket) => {
      newSocket.emit("notification:join", userId);
      setSocket(newSocket);
    },
    [userId, setSocket],
  );

  const handleDisconnect = useCallback(() => {
    clearSocket();
  }, [clearSocket]);

  const handleNewNotification = useCallback(
    (notification) => {
      addRecentNotification(notification);
    },
    [addRecentNotification],
  );

  const handleUnreadCount = useCallback(
    ({ count }) => {
      setUnreadCount(count);
    },
    [setUnreadCount],
  );

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      return;
    }

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    newSocket.on("connect", () => {
      handleConnect(newSocket);
      setSocketState(newSocket);
    });

    newSocket.on("notification:new", handleNewNotification);
    newSocket.on("notification:unread_count", handleUnreadCount);

    newSocket.on("disconnect", () => {
      handleDisconnect();
      setSocketState(null);
    });

    newSocket.on("connect_error", (error) => {
      console.warn("Socket connection error:", error.message);
    });

    return () => {
      newSocket.emit("notification:leave", userId);
      newSocket.off("connect");
      newSocket.off("notification:new", handleNewNotification);
      newSocket.off("notification:unread_count", handleUnreadCount);
      newSocket.off("disconnect");
      newSocket.disconnect();
      setSocketState(null);
      clearSocket();
    };
  }, [
    isAuthenticated,
    userId,
    handleConnect,
    handleDisconnect,
    handleNewNotification,
    handleUnreadCount,
    clearSocket,
  ]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;
