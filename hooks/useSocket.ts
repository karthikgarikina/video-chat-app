"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io({
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to signaling server:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from signaling server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef;
};