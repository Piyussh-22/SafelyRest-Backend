// Handles booking operations (create, view for guest/host, update status, cancel) with validation and user-based access, ensuring controlled and reliable booking management.
import { Request, Response, NextFunction } from "express";
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

export const postBooking = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new AppError(errors.array()[0].msg as string, HTTP_STATUS.UNPROCESSABLE),
    );
  }

  try {
    const { houseId, checkIn, checkOut, guests, message } = req.body;
    const booking = await createBooking({
      guestId: (req as any).user._id,
      houseId,
      checkIn,
      checkOut,
      guests,
      message,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: MSG.BOOKING_CREATED,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

export const getGuestBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const bookings = await fetchGuestBookings((req as any).user._id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

export const getHostBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const bookings = await fetchHostBookings((req as any).user._id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

export const patchBookingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
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

    // @ts-ignore
    const booking = await updateBookingStatus(
      req.params.bookingId as string,
      (req as any).user._id,
      status,
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MSG.BOOKING_UPDATED,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

export const patchCancelBooking = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const booking = await cancelBooking(
      req.params.bookingId as string,
      (req as any).user._id,
    );
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MSG.BOOKING_CANCELLED,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};
