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
router.delete("/houses/:houseId", deleteHouseByAdmin);

export default router;
