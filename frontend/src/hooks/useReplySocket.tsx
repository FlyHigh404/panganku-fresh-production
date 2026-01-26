"use client";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export default function useReplySocket(userId: string | undefined, onNotification: (message: string) => void) {
  // Menggunakan useRef untuk menyimpan instance socket agar tidak terbuat ulang saat render
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || "https://panganku-fresh-production.onrender.com";

    socketRef.current = io(socketUrl, {
      transports: ["websocket"],
      reconnection: true,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("✅ Reply Socket Connected");
      socket.emit("join-user-room", userId);
    });

    socket.on("notification:new", (notif) => {
      console.log("🔔 New Reply Notification:", notif);
      onNotification(notif.message);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Reply Socket Error:", err.message);
    });

    return () => {
      if (socket) {
        socket.off("notification:new");
        socket.emit("leave-user-room", userId);
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [userId, onNotification]);
}