import { validationResult } from "express-validator";
import {
  createBooking,
  fetchGuestBookings,
  fetchHostBookings,
  updateBookingStatus,
  cancelBooking,
} from "../services/booking.service.js";
import { AppError } from "../utils/AppError.js";
import { MSG } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

// POST /bookings — guest creates a booking request
export const postBooking = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, HTTP_STATUS.UNPROCESSABLE));
  }

  try {
    const { houseId, checkIn, checkOut, guests, message } = req.body;
    const booking = await createBooking({
      guestId: req.user._id,
      houseId,
      checkIn,
      checkOut,
      guests,
      message,
    });

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: MSG.BOOKING_CREATED,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// GET /bookings/my — guest sees their bookings
export const getGuestBookings = async (req, res, next) => {
  try {
    const bookings = await fetchGuestBookings(req.user._id);
    return res.status(HTTP_STATUS.OK).json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

// GET /bookings/host — host sees all bookings for their houses
export const getHostBookings = async (req, res, next) => {
  try {
    const bookings = await fetchHostBookings(req.user._id);
    return res.status(HTTP_STATUS.OK).json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

// PATCH /bookings/:bookingId/status — host confirms or rejects
export const patchBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["confirmed", "rejected"].includes(status)) {
      return next(
        new AppError(
          "Status must be confirmed or rejected",
          HTTP_STATUS.BAD_REQUEST,
        ),
      );
    }

    const booking = await updateBookingStatus(
      req.params.bookingId,
      req.user._id,
      status,
    );

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MSG.BOOKING_UPDATED,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /bookings/:bookingId/cancel — guest cancels their booking
export const patchCancelBooking = async (req, res, next) => {
  try {
    const booking = await cancelBooking(req.params.bookingId, req.user._id);
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MSG.BOOKING_CANCELLED,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};
