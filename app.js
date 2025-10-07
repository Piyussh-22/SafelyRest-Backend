// External
import express from "express";
import cors from "cors";
import "dotenv/config";

// Local
import authRoutes from "./src/routes/auth.routes.js";
import storeRoutes from "./src/routes/store.routes.js";
import hostRoutes from "./src/routes/host.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import { connectDB } from "./src/utils/db.util.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import { protect, restrictTo } from "./src/middlewares/auth.js";

const app = express();

// Core middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

console.log("🟢 App middlewares configured (JWT only)");

// Public routes (no auth required)
app.use("/api/auth", authRoutes);
app.use("/api/store", storeRoutes);

// Protected routes
app.use("/api/host", protect, restrictTo("host"), hostRoutes);
app.use("/api/admin", protect, restrictTo("admin"), adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🟢 Live at PORT:${PORT}`));
});
