import User from "../models/user.js";
import { House } from "../models/house.js";
import { Booking } from "../models/booking.js";
import { AppError } from "../utils/AppError.js";
import { MSG } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import cloudinary from "../config/cloudinary.config.js";

export const fetchAdminStats = async () => {
  const [
    totalMembers,
    totalHosts,
    totalGuests,
    totalHouses,
    totalBookings,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ userType: "host" }),
    User.countDocuments({ userType: "guest" }),
    House.countDocuments(),
    Booking.countDocuments(),
    User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("firstName email userType createdAt"),
  ]);

  return {
    totalMembers,
    totalHosts,
    totalGuests,
    totalHouses,
    totalBookings,
    recentUsers,
  };
};

export const fetchAllBookings = async ({ status, page, limit }) => {
  const query = {};

  if (status) query.status = status;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(20, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate("guest", "firstName email")
      .populate("house", "name location price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Booking.countDocuments(query),
  ]);

  return {
    bookings,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const removeHouseByAdmin = async (houseId) => {
  const house = await House.findById(houseId);
  if (!house) {
    throw new AppError(MSG.HOUSE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  for (const url of house.photos) {
    try {
      const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);

      if (matches) {
        await cloudinary.uploader.destroy(matches[1]);
      }
    } catch (err) {
      console.warn(`Failed to delete Cloudinary image: ${url}`, err.message);
    }
  }

  await House.findOneAndDelete({ _id: houseId });
  await Booking.deleteMany({ house: houseId });
};
