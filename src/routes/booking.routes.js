import express from "express";
import {
  postBooking,
  getGuestBookings,
  getHostBookings,
  patchBookingStatus,
  patchCancelBooking,
} from "../controllers/booking.controller.js";
import { protect, restrictTo } from "../middlewares/auth.js";
import { bookingValidation } from "../validations/booking.validation.js";

const bookingRoutes = express.Router();

// Guest routes
bookingRoutes.post(
  "/",
  protect,
  restrictTo("guest"),
  bookingValidation,
  postBooking,
);
bookingRoutes.get("/my", protect, restrictTo("guest"), getGuestBookings);
bookingRoutes.patch(
  "/:bookingId/cancel",
  protect,
  restrictTo("guest"),
  patchCancelBooking,
);

// Host routes
bookingRoutes.get("/host", protect, restrictTo("host"), getHostBookings);
bookingRoutes.patch(
  "/:bookingId/status",
  protect,
  restrictTo("host"),
  patchBookingStatus,
);

export default bookingRoutes;
