import { create } from "zustand";

const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,

  setSocket: (socket) => {
    set({ socket, isConnected: true });
  },

  clearSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
    }
    set({ socket: null, isConnected: false });
  },

  getSocket: () => {
    return get().socket;
  },
}));

export { useSocketStore };
