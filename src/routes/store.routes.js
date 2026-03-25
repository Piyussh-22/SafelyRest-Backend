import express from "express";
import {
  getHouses,
  getHouseDetails,
  getFavouriteList,
  toggleFavourite,
  getHouseAvailability,
} from "../controllers/store.controller.js";
import { protect, restrictTo } from "../middlewares/auth.js";

const storeRoutes = express.Router();

storeRoutes.get("/houses", getHouses);
storeRoutes.get("/houses/:houseId", getHouseDetails);
storeRoutes.get("/houses/:houseId/availability", getHouseAvailability);

storeRoutes.use(protect, restrictTo("guest", "host"));
storeRoutes.get("/favourites", getFavouriteList);
storeRoutes.post("/favourites", toggleFavourite);

export default storeRoutes;
