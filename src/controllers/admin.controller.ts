// Handles admin HTTP requests by calling services for stats, bookings, and house deletion, and returning formatted API responses.
import { Request, Response, NextFunction } from "express";
import {
  fetchAdminStats,
  fetchAllBookings,
  removeHouseByAdmin,
} from "../services/admin.service.js";
import { AppError } from "../utils/AppError.js";
import { MSG } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

export const getAdminStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const stats = await fetchAdminStats();
    res.status(HTTP_STATUS.OK).json({ success: true, data: stats });
  } catch (err) {
    next(new AppError(MSG.FETCH_STATS_FAIL, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

export const getAllBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { status, page, limit } = req.query;
    const result = await fetchAllBookings({ status, page, limit });
    res.status(HTTP_STATUS.OK).json({ success: true, ...result });
  } catch (err) {
    next(
      new AppError(
        MSG.FETCH_ALL_BOOKINGS_FAIL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ),
    );
  }
};

export const deleteHouseByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await removeHouseByAdmin(req.params.houseId as string);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MSG.HOUSE_DELETED_ADMIN,
    });
  } catch (err) {
    next(err);
  }
};
