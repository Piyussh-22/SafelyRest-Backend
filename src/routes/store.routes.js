import express from "express";
import {
  getHouses,
  getHouseDetails,
  getFavouriteList,
  toggleFavourite,
} from "../controllers/store.controller.js";
import { protect, restrictTo } from "../middlewares/auth.js";

const storeRoutes = express.Router();

// Public
storeRoutes.get("/houses", getHouses);
storeRoutes.get("/houses/:houseId", getHouseDetails);

// Authenticated (guests & hosts)
storeRoutes.use(protect, restrictTo("guest", "host"));
storeRoutes.get("/favourites", getFavouriteList);

// add/remove to/from favourites list
storeRoutes.post("/favourites", toggleFavourite);

export default storeRoutes;
