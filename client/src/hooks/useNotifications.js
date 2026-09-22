import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as notificationService from "@services/notification.service.js";
import { useNotificationStore } from "@store/notificationStore.js";
import QUERY_KEYS from "@constants/queryKeys.js";
import toast from "react-hot-toast";

const useNotifications = (filters) => {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.ALL(filters),
    queryFn: async () => {
      const response = await notificationService.getNotifications(filters);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
};

const useUnreadCount = () => {
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT,
    queryFn: async () => {
      const response = await notificationService.getUnreadCount();
      const count = response.data.count;
      setUnreadCount(count);
      return count;
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
};

const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { decrementUnreadCount } = useNotificationStore();

  return useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS.ALL({}),
      });
      decrementUnreadCount();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to mark notification as read");
    },
  });
};

const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { resetUnreadCount } = useNotificationStore();

  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS.ALL({}),
      });
      resetUnreadCount();
      toast.success("All notifications marked as read");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to mark all as read");
    },
  });
};

const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS.ALL({}),
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete notification");
    },
  });
};

const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();
  const { resetUnreadCount } = useNotificationStore();

  return useMutation({
    mutationFn: notificationService.deleteAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS.ALL({}),
      });
      resetUnreadCount();
      toast.success("All notifications deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete notifications");
    },
  });
};

export {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
};
