import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./src/routes/auth.routes.js";
import storeRoutes from "./src/routes/store.routes.js";
import hostRoutes from "./src/routes/host.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import bookingRoutes from "./src/routes/booking.routes.js";
import { connectDB } from "./src/utils/db.util.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import { protect, restrictTo } from "./src/middlewares/auth.js";
import { MSG } from "./src/constants/messages.js";
import { HTTP_STATUS } from "./src/constants/httpStatus.js";
import { ROLES } from "./src/constants/roles.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Public
app.use("/api/auth", authRoutes);
app.use("/api/store", storeRoutes);

// Uptime monitoring
app.get("/uptime", (_req, res) => res.status(HTTP_STATUS.OK).send("OK"));

// Protected
app.use("/api/bookings", bookingRoutes);
app.use("/api/host", protect, restrictTo(ROLES.HOST), hostRoutes);
app.use("/api/admin", protect, restrictTo(ROLES.ADMIN), adminRoutes);

// 404
app.use((_req, res) => {
  res
    .status(HTTP_STATUS.NOT_FOUND)
    .json({ success: false, message: MSG.ROUTE_NOT_FOUND });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🟢 Server running on PORT ${PORT}`));
});
