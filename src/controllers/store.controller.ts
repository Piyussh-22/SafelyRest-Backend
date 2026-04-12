// Handles public store operations (browse houses, view details, manage favourites, check availability) with filtering and validation, enabling users to explore and interact with listings efficiently.
import { Request, Response, NextFunction } from "express";
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

export const getHouses = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
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
    res.status(HTTP_STATUS.OK).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getHouseDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const house = await fetchHouseById(req.params.houseId as string);
    res.status(HTTP_STATUS.OK).json({ success: true, data: house });
  } catch (err) {
    next(err);
  }
};

export const getFavouriteList = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const favourites = await fetchFavourites((req as any).user._id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: favourites });
  } catch (err) {
    next(err);
  }
};

export const toggleFavourite = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { houseId } = req.body;
    if (!houseId) {
      return next(new AppError(MSG.HOUSE_ID_REQUIRED, HTTP_STATUS.BAD_REQUEST));
    }
    const { removed, favourites } = await toggleFavouriteService(
      houseId,
      (req as any).user._id,
    );
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: removed ? MSG.REMOVED_FAVOURITE : MSG.ADDED_FAVOURITE,
      data: favourites,
    });
  } catch (err) {
    next(err);
  }
};

export const getHouseAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { checkIn, checkOut } = req.query;
    const { houseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(houseId as string)) {
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
      houseId as string,
      checkIn,
      checkOut,
    );
    res.status(HTTP_STATUS.OK).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
