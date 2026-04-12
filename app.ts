// Entry point: sets up Express app with middleware, routes, error handling, and DB connection. Exports app for testing.
import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./src/routes/auth.routes.js";
import storeRoutes from "./src/routes/store.routes.js";
import hostRoutes from "./src/routes/host.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import bookingRoutes from "./src/routes/booking.routes.js";
import { connectDB } from "./src/utils/db.util.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import { MSG } from "./src/constants/messages.js";
import { HTTP_STATUS } from "./src/constants/httpStatus.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: [
      "http://localhost",
      "http://localhost:5173",
      process.env.FRONTEND_URL,
    ],
    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/store", storeRoutes);

app.get("/uptime", (_req: Request, res: Response) => {
  console.log("uptime endpoint hit");
  res.status(HTTP_STATUS.OK).send("OK");
});

app.use("/api/bookings", bookingRoutes);
app.use("/api/host", hostRoutes);
app.use("/api/admin", adminRoutes);

app.use((_req: Request, res: Response) => {
  res
    .status(HTTP_STATUS.NOT_FOUND)
    .json({ success: false, message: MSG.ROUTE_NOT_FOUND });
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== "test") {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`🟢 Server running on PORT ${PORT}`));
  });
}

export default app;
