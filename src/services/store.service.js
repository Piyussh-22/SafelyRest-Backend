import { House } from "../models/house.js";
import { Favourite } from "../models/favourite.js";
import { Booking } from "../models/booking.js";
import { AppError } from "../utils/AppError.js";
import { MSG } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

export const fetchAllHouses = async ({
  location,
  minPrice,
  maxPrice,
  amenities,
  page,
  limit,
}) => {
  const query = { isAvailable: true };

  if (location) {
    query.location = { $regex: location, $options: "i" };
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (amenities) {
    const list = Array.isArray(amenities) ? amenities : amenities.split(",");
    query.amenities = { $all: list };
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(20, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [houses, total] = await Promise.all([
    House.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 }),
    House.countDocuments(query),
  ]);

  return {
    houses,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const fetchHouseById = async (houseId) => {
  const house = await House.findById(houseId);
  if (!house) {
    throw new AppError(MSG.HOUSE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  return house;
};

export const fetchFavourites = async (userId) => {
  const favourites = await Favourite.find({ userId }).populate("houseId");
  return favourites.map((fav) => ({
    ...fav.houseId.toObject(),
    isFav: true,
  }));
};

export const toggleFavourite = async (houseId, userId) => {
  if (!houseId) {
    throw new AppError(MSG.HOUSE_ID_REQUIRED, HTTP_STATUS.BAD_REQUEST);
  }

  const existing = await Favourite.findOne({ houseId, userId });

  if (existing) {
    await Favourite.findOneAndDelete({ houseId, userId });
  } else {
    try {
      await Favourite.create({ houseId, userId });
    } catch (err) {
      if (err.code !== 11000) throw err;
    }
  }

  return await fetchFavourites(userId);
};

export const checkHouseAvailability = async (houseId, checkIn, checkOut) => {
  const house = await House.findById(houseId);
  if (!house) {
    throw new AppError(MSG.HOUSE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  if (!house.isAvailable) {
    return { available: false, reason: "Host has paused this listing" };
  }

  const conflict = await Booking.findOne({
    house: houseId,
    status: { $in: ["pending", "confirmed"] },
    $or: [
      {
        checkIn: { $lt: new Date(checkOut) },
        checkOut: { $gt: new Date(checkIn) },
      },
    ],
  });

  if (conflict) {
    return { available: false, reason: "Already booked for these dates" };
  }

  return { available: true };
};
