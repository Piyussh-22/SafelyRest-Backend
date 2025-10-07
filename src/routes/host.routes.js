// src/routes/host.routes.js
import express from "express";
import {
  addHouse,
  getHostHouses,
  deleteHouse,
} from "../controllers/host.controller.js";
import { upload } from "../middlewares/uploadCloudinary.js";

const router = express.Router();

// routes are protechted at app.js

/**
 * Add a new house
 * - Allows max 2 photos
 */
router.post("/houses", upload.array("photos", 2), addHouse);

/* Get all houses owned by the logged-in host
 */
router.get("/houses", getHostHouses);

/* Delete a house by ID
 */
router.delete("/houses/:houseId", deleteHouse);

export default router;
