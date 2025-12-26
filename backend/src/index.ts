import express, { Request, Response } from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { setupSocketHandlers } from "./app/api/websocket/socketHandler";
import { createNotifyRouter } from "./app/api/websocket/route";

// admin routes
import adminCategories from "@/app/api/admin/categories/route";
import adminCategoriesById from "@/app/api/admin/categories/[id]/route";
import adminCustomers from "@/app/api/admin/customers/route";
import adminCustomersById from "@/app/api/admin/customers/[id]/route";
import adminDashboard from "@/app/api/admin/dashboard/route";
import adminNotifications from "@/app/api/admin/notifications/route";
import adminOrder from "@/app/api/admin/order/route";
import adminOrderById from "@/app/api/admin/order/[id]/route";
import adminProducts from "@/app/api/admin/products/route";
import adminProductsById from "@/app/api/admin/products/[id]/route";
import adminProfile from "@/app/api/admin/profile/route";
import adminPassword from "@/app/api/admin/profile/password/route";
import adminReplyReview from "@/app/api/admin/reply-review/route";

// auth routes
import signUpRoutes from "@/app/api/auth/signup/route";
import signInRoutes from "@/app/api/auth/[...nextauth]/route";
import googleRoutes from "@/app/api/auth/google/route";

import cartRoutes from "@/app/api/cart/route";
import notificationRoutes from "@/app/api/notifications/route";
import orderRoutes from "@/app/api/order/route";
import allProducts from "@/app/api/all-products/route";

// products routes
import productRoutes from "@/app/api/products/route";
import categoriesRoutes from "@/app/api/products/categories/route";
import searchRoutes from "@/app/api/products/search/route";
import productByIdRoutes from "@/app/api/products/[id]/route";
import relatedProduct from "@/app/api/products/[id]/produk-terkait/route";

// profile routes
import profileRoutes from "@/app/api/profile/route";
import addressRoutes from "@/app/api/profile/address/route";
import addressByIdRoutes from "@/app/api/profile/address/[id]/route";
import addressPrimaryRoutes from "@/app/api/profile/address-primary/route";
import profileOrderRoutes from "@/app/api/profile/order/route";

// upload routes
import uploadRoutes from "@/app/api/upload/route"

const app = express();
app.use(express.json);

const corsOptions = {
  origin: 'https://pangankufresh.com', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
const httpServer = createServer(app);

// Konfigurasi Socket.io
const io = new Server(httpServer, {
  transports: ["websocket"],
  cors: {
    origin: process.env.FRONTEND_URL || "https://pangankufresh.com",
    methods: ["GET", "POST"]
  },
});

setupSocketHandlers(io);

// Endpoint route
// Admin
app.use('/app/api/admin', adminCategories);
app.use('/app/api/admin', adminCategoriesById);
app.use('/app/api/admin', adminCustomers);
app.use('/app/api/admin', adminCustomersById);
app.use('/app/api/admin', adminDashboard);
app.use('/app/api/admin', adminNotifications);
app.use('/app/api/admin', adminOrder);
app.use('/app/api/admin', adminOrderById);
app.use('/app/api/admin', adminProducts);
app.use('/app/api/admin', adminProductsById);
app.use('/app/api/admin', adminProfile);
app.use('/app/api/admin', adminPassword);
app.use('/app/api/admin', adminReplyReview);

// Signup
app.use('/app/api/auth/signup', signUpRoutes);
app.use('/app/api/auth/[...nextauth]', signInRoutes);
app.use('/app/api/auth/google', googleRoutes);

app.use('/app/api/all-products', allProducts);
app.use('/app/api/cart', cartRoutes);
app.use('/app/api/notifications', notificationRoutes);
app.use('/app/api/order', orderRoutes);

// Products
app.use('/app/api/products', productRoutes);
app.use('/app/api/products', categoriesRoutes);
app.use('/app/api/products', searchRoutes);
app.use('/app/api/products', productByIdRoutes);
app.use('/app/api/products', relatedProduct);

//Profile
app.use('/app/api/profile', profileRoutes);
app.use('/app/api/profile', addressRoutes);
app.use('/app/api/profile', addressByIdRoutes);
app.use('/app/api/profile', addressPrimaryRoutes);
app.use('/app/api/profile', profileOrderRoutes);

// app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use('/app/api/upload', uploadRoutes);

// Inisialisasi API Routes untuk Internal Trigger
app.use("/notify", createNotifyRouter(io));

// Health Check untuk Monitoring Render
app.get("/health", (req, res) => res.send("Realtime Server is Healthy"));

// Gunakan process.env.PORT agar bisa berjalan di Render
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`⚡ Realtime server running on port ${PORT}`);
});