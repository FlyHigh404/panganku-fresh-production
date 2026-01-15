"use client";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export default function useReplySocket(userId: string | undefined, onNotification: (message: string) => void) {
  // Menggunakan useRef untuk menyimpan instance socket agar tidak terbuat ulang saat render
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Jangan jalankan jika userId tidak ada
    if (!userId) return;

    // 1. Arahkan ke URL backend di Render (NEXT_PUBLIC_API_URL)
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || "https://panganku-fresh-production.onrender.com";

    socketRef.current = io(socketUrl, {
      transports: ["websocket"], // Lebih stabil untuk hosting seperti Hostinger/Render
      reconnection: true,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("✅ Reply Socket Connected:", socket.id);

      // 2. Gunakan event join untuk masuk ke room spesifik User
      // Agar notifikasi reply hanya diterima oleh user yang bersangkutan
      socket.emit("join-user-room", userId);
    });

    // 3. Gunakan socket.on (bukan variabel global)
    socket.on("notification:new", (notif) => {
      console.log("🔔 New Reply Notification:", notif);
      onNotification(notif.message);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Reply Socket Error:", err.message);
    });

    // Cleanup: Membersihkan event listener dan koneksi saat komponen unmount
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