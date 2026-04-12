// Handles host house management including fetching, creating, and deleting houses with image and booking cleanup.
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.config.js";
import { House } from "../models/house.js";
import { AppError } from "../utils/AppError.js";
import { MSG } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { Booking } from "../models/booking.js";

export const fetchHostHouses = async (ownerId: any) => {
  return await House.find({ owner: ownerId });
};

export const createHouse = async ({
  name,
  price,
  location,
  description,
  amenities,
  capacity,
  photos,
  ownerId,
}: {
  name: string;
  price: any;
  location: string;
  description: string;
  amenities: string[];
  capacity: number;
  photos: string[];
  ownerId: any;
}) => {
  return await House.create({
    name,
    price: Number(price),
    location,
    description,
    amenities,
    capacity,
    photos,
    owner: ownerId,
  });
};

export const removeHouse = async (houseId: string, ownerId: any) => {
  if (!mongoose.Types.ObjectId.isValid(houseId)) {
    throw new AppError(MSG.INVALID_HOUSE_ID, HTTP_STATUS.BAD_REQUEST);
  }

  const house = await House.findOne({ _id: houseId, owner: ownerId });
  if (!house) {
    throw new AppError(MSG.HOUSE_NOT_OWNED, HTTP_STATUS.NOT_FOUND);
  }

  for (const url of house.photos) {
    try {
      const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
      if (matches) {
        await cloudinary.uploader.destroy(matches[1]);
      }
    } catch (err: any) {
      console.warn(`Failed to delete Cloudinary image: ${url}`, err.message);
    }
  }

  await House.findOneAndDelete({ _id: houseId });
  await Booking.deleteMany({ house: houseId });
};
