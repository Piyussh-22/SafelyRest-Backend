import {
  fetchAllHouses,
  fetchHouseById,
  fetchFavourites,
  toggleFavourite as toggleFavouriteService,
  checkHouseAvailability,
} from "../services/store.service.js";
import { MSG } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { AppError } from "../utils/AppError.js";
import mongoose from "mongoose";

// GET /store/houses
export const getHouses = async (req, res, next) => {
  try {
    const { location, minPrice, maxPrice, amenities, page, limit } = req.query;
    const result = await fetchAllHouses({
      location,
      minPrice,
      maxPrice,
      amenities,
      page,
      limit,
    });
    return res.status(HTTP_STATUS.OK).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

// GET /store/houses/:houseId
export const getHouseDetails = async (req, res, next) => {
  try {
    const house = await fetchHouseById(req.params.houseId);
    return res.status(HTTP_STATUS.OK).json({ success: true, data: house });
  } catch (err) {
    next(err);
  }
};

// GET /store/favourites
export const getFavouriteList = async (req, res, next) => {
  try {
    const favourites = await fetchFavourites(req.user._id);
    return res.status(HTTP_STATUS.OK).json({ success: true, data: favourites });
  } catch (err) {
    next(err);
  }
};

// POST /store/favourites
export const toggleFavourite = async (req, res, next) => {
  try {
    const { houseId } = req.body;
    if (!houseId) {
      return next(new AppError(MSG.HOUSE_ID_REQUIRED, HTTP_STATUS.BAD_REQUEST));
    }
    const { removed, favourites } = await toggleFavouriteService(
      houseId,
      req.user._id,
    );
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: removed ? MSG.REMOVED_FAVOURITE : MSG.ADDED_FAVOURITE,
      data: favourites,
    });
  } catch (err) {
    next(err);
  }
};

export const getHouseAvailability = async (req, res, next) => {
  try {
    const { checkIn, checkOut } = req.query;
    const { houseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(houseId)) {
      return next(new AppError(MSG.INVALID_HOUSE_ID, HTTP_STATUS.BAD_REQUEST));
    }

    if (!checkIn || !checkOut) {
      return next(
        new AppError(
          "checkIn and checkOut are required",
          HTTP_STATUS.BAD_REQUEST,
        ),
      );
    }

    const result = await checkHouseAvailability(
      req.params.houseId,
      checkIn,
      checkOut,
    );

    return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
