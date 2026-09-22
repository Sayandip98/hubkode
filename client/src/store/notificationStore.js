import { create } from "zustand";

const useNotificationStore = create((set, get) => ({
  unreadCount: 0,
  recentNotifications: [],

  setUnreadCount: (count) => {
    set({ unreadCount: count });
  },

  incrementUnreadCount: () => {
    set((state) => ({ unreadCount: state.unreadCount + 1 }));
  },

  decrementUnreadCount: () => {
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  resetUnreadCount: () => {
    set({ unreadCount: 0 });
  },

  addRecentNotification: (notification) => {
    set((state) => ({
      recentNotifications: [notification, ...state.recentNotifications].slice(
        0,
        10,
      ),
      unreadCount: state.unreadCount + 1,
    }));
  },

  clearRecentNotifications: () => {
    set({ recentNotifications: [] });
  },
}));

export { useNotificationStore };
