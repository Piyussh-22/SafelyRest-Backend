import { Booking } from "../models/booking.js";
import { House } from "../models/house.js";
import { AppError } from "../utils/AppError.js";
import { MSG } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { toISTMidnight, getNights } from "../utils/date.util.js";
import mongoose from "mongoose";

const hasOverlap = (checkIn, checkOut) => ({
  $or: [
    {
      checkIn: { $lt: toISTMidnight(checkOut) },
      checkOut: { $gt: toISTMidnight(checkIn) },
    },
  ],
});

const expirePendingBookings = async (houseId) => {
  const todayIST = toISTMidnight(new Date());
  await Booking.updateMany(
    { house: houseId, status: "pending", checkIn: { $lt: todayIST } },
    { $set: { status: "cancelled" } },
  );
};

const rejectOverlappingBookings = async (confirmedBooking) => {
  await Booking.updateMany(
    {
      _id: { $ne: confirmedBooking._id },
      house: confirmedBooking.house,
      status: "pending",
      ...hasOverlap(confirmedBooking.checkIn, confirmedBooking.checkOut),
    },
    { $set: { status: "rejected" } },
  );
};

export const createBooking = async ({
  guestId,
  houseId,
  checkIn,
  checkOut,
  guests,
  message,
}) => {
  await expirePendingBookings(houseId);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const house = await House.findById(houseId)
      .populate("owner", "firstName email")
      .session(session);

    if (!house) {
      throw new AppError(MSG.HOUSE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (!house.isAvailable) {
      throw new AppError(MSG.HOUSE_NOT_AVAILABLE, HTTP_STATUS.BAD_REQUEST);
    }

    if (house.owner._id.toString() === guestId.toString()) {
      throw new AppError(MSG.CANNOT_BOOK_OWN_HOUSE, HTTP_STATUS.BAD_REQUEST);
    }

    if (guests > house.capacity) {
      throw new AppError(
        `This house has a maximum capacity of ${house.capacity} guests`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const houseConflict = await Booking.findOne({
      house: houseId,
      status: "confirmed",
      ...hasOverlap(checkIn, checkOut),
    }).session(session);

    if (houseConflict) {
      throw new AppError(MSG.HOUSE_ALREADY_BOOKED, HTTP_STATUS.CONFLICT);
    }

    const guestConflict = await Booking.findOne({
      guest: guestId,
      house: houseId,
      status: { $in: ["pending", "confirmed"] },
      ...hasOverlap(checkIn, checkOut),
    }).session(session);

    if (guestConflict) {
      throw new AppError(MSG.BOOKING_OVERLAP, HTTP_STATUS.CONFLICT);
    }

    const nights = getNights(checkIn, checkOut);
    if (nights <= 0) {
      throw new AppError(
        "Check-out must be after check-in",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const totalPrice = nights * house.price;

    const [booking] = await Booking.create(
      [
        {
          guest: guestId,
          house: houseId,
          checkIn: toISTMidnight(checkIn),
          checkOut: toISTMidnight(checkOut),
          guests,
          totalPrice,
          message,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession(); // ✅ end session BEFORE populate

    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: "house",
        select: "name location price photos amenities capacity",
      })
      .populate({
        path: "guest",
        select: "firstName email",
      });

    return populatedBooking;
  } catch (err) {
    try {
      await session.abortTransaction();
    } catch (abortErr) {
      console.error("Abort failed:", abortErr);
    }
    throw err;
  } finally {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
  }
};

export const fetchGuestBookings = async (guestId) => {
  const bookings = await Booking.find({ guest: guestId })
    .populate({
      path: "house",
      select: "name location price photos amenities capacity owner",
      populate: { path: "owner", select: "firstName email" },
    })
    .sort({ createdAt: -1 });

  return bookings.map((booking) => {
    const data = booking.toObject();

    if (!data.house) return data;

    if (data.status === "confirmed" && data.house.owner) {
      data.hostContact = {
        name: data.house.owner.firstName,
        email: data.house.owner.email,
      };
    }

    if (data.house) delete data.house.owner;
    return data;
  });
};

export const fetchHostBookings = async (hostId) => {
  const houses = await House.find({ owner: hostId }).select("_id");
  const houseIds = houses.map((h) => h._id);

  return await Booking.find({ house: { $in: houseIds } })
    .populate("house", "name location price photos capacity")
    .populate("guest", "firstName email")
    .sort({ createdAt: -1 });
};

export const updateBookingStatus = async (bookingId, hostId, status) => {
  const booking = await Booking.findById(bookingId).populate({
    path: "house",
    select: "owner",
  });

  if (!booking) {
    throw new AppError(MSG.BOOKING_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  if (!booking.house) {
    throw new AppError(MSG.HOUSE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  if (booking.house.owner.toString() !== hostId.toString()) {
    throw new AppError(MSG.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  if (booking.status !== "pending") {
    throw new AppError(MSG.BOOKING_ALREADY_RESOLVED, HTTP_STATUS.BAD_REQUEST);
  }

  booking.status = status;
  await booking.save();

  if (status === "confirmed") {
    await rejectOverlappingBookings(booking);
  }

  return await Booking.findById(booking._id)
    .populate("house", "name location price photos capacity")
    .populate("guest", "firstName email");
};

export const cancelBooking = async (bookingId, guestId) => {
  const booking = await Booking.findOne({ _id: bookingId, guest: guestId });

  if (!booking) {
    throw new AppError(MSG.BOOKING_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  if (booking.status !== "pending") {
    throw new AppError(MSG.BOOKING_ALREADY_RESOLVED, HTTP_STATUS.BAD_REQUEST);
  }

  booking.status = "cancelled";
  await booking.save();

  return booking;
};

export const checkHouseAvailability = async (houseId, checkIn, checkOut) => {
  const house = await House.findById(houseId);

  if (!house) {
    throw new AppError(MSG.HOUSE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  if (!house.isAvailable) {
    return { available: false, reason: "Host has paused this listing" };
  }

  await expirePendingBookings(houseId);

  const conflict = await Booking.findOne({
    house: houseId,
    status: "confirmed",
    ...hasOverlap(checkIn, checkOut),
  });

  if (conflict) {
    return { available: false, reason: "Already booked for these dates" };
  }

  return { available: true };
};
