import {
  fetchAdminStats,
  fetchAllBookings,
  removeHouseByAdmin,
} from "../services/admin.service.js";
import { AppError } from "../utils/AppError.js";
import { MSG } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

export const getAdminStats = async (req, res, next) => {
  try {
    const stats = await fetchAdminStats();
    return res.status(HTTP_STATUS.OK).json({ success: true, data: stats });
  } catch (err) {
    next(new AppError(MSG.FETCH_STATS_FAIL, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await fetchAllBookings({ status, page, limit });
    return res.status(HTTP_STATUS.OK).json({ success: true, ...result });
  } catch (err) {
    next(
      new AppError(
        MSG.FETCH_ALL_BOOKINGS_FAIL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ),
    );
  }
};

export const deleteHouseByAdmin = async (req, res, next) => {
  try {
    await removeHouseByAdmin(req.params.houseId);
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MSG.HOUSE_DELETED_ADMIN,
    });
  } catch (err) {
    next(err);
  }
};
