import express from "express";
import {
  getAdminStats,
  getAllBookings,
  deleteHouseByAdmin,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/stats", getAdminStats);
router.get("/bookings", getAllBookings);
router.delete("/houses/:houseId", deleteHouseByAdmin);

export default router;
