import express from "express";
import {
  addHouse,
  getHostHouses,
  deleteHouse,
} from "../controllers/host.controller.js";
import { upload } from "../middlewares/upload.js";
import { addHouseValidation } from "../validations/host.validation.js";
import { protect, restrictTo } from "../middlewares/auth.js";

const router = express.Router();

router.use(protect, restrictTo("host"));

router.get("/houses", getHostHouses);
router.post("/houses", upload.array("photos", 2), addHouseValidation, addHouse);
router.delete("/houses/:houseId", deleteHouse);

export default router;
