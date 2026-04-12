// Defines admin-only routes for viewing platform stats, all bookings, and force-deleting house listings.
import express from "express";
import {
  getAdminStats,
  getAllBookings,
  deleteHouseByAdmin,
} from "../controllers/admin.controller.js";
import { protect, restrictTo } from "../middlewares/auth.js";

const router = express.Router();

router.use(protect, restrictTo("admin"));

router.get("/stats", getAdminStats);
router.get("/bookings", getAllBookings);
// TODO: Uncomment when admin delete UI is ready on frontend
// router.delete("/houses/:houseId", deleteHouseByAdmin);

export default router;
