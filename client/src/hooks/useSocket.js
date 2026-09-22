import { useContext } from "react";
import SocketContext from "../context/SocketContext.js";

const useSocket = () => {
  return useContext(SocketContext);
};

export { useSocket };
