import { Server, Socket } from "socket.io";

export const setupSocketHandlers = (io: Server) => {
    io.on("connection", (socket: Socket) => {
        console.log("🟢 Client connected:", socket.id);

        // Room untuk pemantauan status pesanan (Order Tracking)
        socket.on("join-order-room", (orderId: string) => {
            socket.join(`order_${orderId}`);
            console.log(`📦 Room Joined: order_${orderId}`);
        });

        // Room untuk notifikasi privat user (Reply Admin/Promo)
        socket.on("join-user-room", (userId: string) => {
            socket.join(`user_${userId}`);
            console.log(`👤 Room Joined: user_${userId}`);
        });

        socket.on("disconnect", () => {
            console.log("🔴 Client disconnected:", socket.id);
        });
    });
};