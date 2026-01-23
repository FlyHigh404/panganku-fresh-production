"use client";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export default function useOrderSocket(orderId: string | undefined, onUpdate: (status: string) => void) {
  // Gunakan useRef agar instance socket terjaga selama komponen hidup
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!orderId) return;

    // 1. Pointing ke URL Backend di Render
    // Gunakan NEXT_PUBLIC_API_URL yang sudah kita set sebelumnya
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || "https://panganku-fresh-production.onrender.com";

    socketRef.current = io(socketUrl, {
      transports: ["websocket"], // Memaksa websocket agar lebih stabil di beberapa hosting
      reconnection: true
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      // console.log("✅ Connected to WebSocket:", socket.id);

      // 2. Beritahu server kita ingin memantau orderId spesifik ini
      // Ini mencegah data "bocor" ke user lain
      socket.emit("join-order-room", orderId);
    });

    socket.on("order:update", (data) => {
      // Data sekarang lebih spesifik karena dikirim lewat room
      if (data.orderId === orderId) {
        // console.log("🟢 Update Order Status:", data.status);
        onUpdate(data.status);
      }
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket Connection Error:", err.message);
    });

    // Cleanup connection saat komponen unmount
    return () => {
      if (socket) {
        socket.emit("leave-order-room", orderId);
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [orderId, onUpdate]); // onUpdate harus di-wrap useCallback di komponen pemanggil jika memungkinkan
}