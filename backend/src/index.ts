import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import { prisma } from "./lib/prisma";

const app = express();
// Pastikan CORS mengizinkan domain frontend Hostinger Anda nantinya
app.use(cors());
app.use(bodyParser.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  // Gunakan "websocket" sebagai transport utama agar lebih stabil di Render
  transports: ["websocket"],
  cors: {
    origin: "*", // Saat produksi, ganti dengan domain Hostinger Anda
    methods: ["GET", "POST"]
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  // Sesuai dengan useOrderSocket di frontend
  socket.on("join-order-room", (orderId: string) => {
    socket.join(`order_${orderId}`);
    console.log(`📦 Client joined order room: order_${orderId}`);
  });

  // Sesuai dengan useReplySocket di frontend
  socket.on("join-user-room", (userId: string) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User joined private room: user_${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// Endpoint untuk update status order (Midtrans/Admin)
app.post("/notify", async (req: Request, res: Response) => {
  try {
    const { orderId, status } = req.body;

    // Update DB
    await prisma.order.update({ where: { id: orderId }, data: { status } });

    // Kirim hanya ke room order yang spesifik agar efisien
    io.to(`order_${orderId}`).emit("order:update", { orderId, status });

    console.log(`📦 Order ${orderId} updated → ${status}`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Notify error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint untuk reply admin
app.post("/notify/reply", async (req: Request, res: Response) => {
  try {
    const { userId, notification } = req.body;

    // Kirim hanya ke room user yang spesifik
    io.to(`user_${userId}`).emit("notification:new", notification);

    console.log(`📨 Reply notification sent to user_${userId}`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error sending reply notification:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Gunakan process.env.PORT agar bisa berjalan di Render
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`⚡ Realtime server running on port ${PORT}`);
});