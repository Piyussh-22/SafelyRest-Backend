// Routes are protected at app.js
// src/routes/admin.routes.js
import express from "express";
import { getAdminStats } from "../controllers/admin.controller.js";

const router = express.Router();

// Admin dashboard stats
router.get("/stats", getAdminStats);

export default router;
