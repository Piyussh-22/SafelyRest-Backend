import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.config.js";
import { House } from "../models/house.js";
import { AppError } from "../utils/AppError.js";
import { MSG } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

export const fetchHostHouses = async (ownerId) => {
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

export const removeHouse = async (houseId, ownerId) => {
  if (!mongoose.Types.ObjectId.isValid(houseId)) {
    throw new AppError(MSG.INVALID_HOUSE_ID, HTTP_STATUS.BAD_REQUEST);
  }

  const house = await House.findOne({ _id: houseId, owner: ownerId });
  if (!house) {
    throw new AppError(MSG.HOUSE_NOT_OWNED, HTTP_STATUS.NOT_FOUND);
  }

  for (const url of house.photos) {
    try {
      const parts = url.split("/");
      const filename = parts[parts.length - 1].split(".")[0];
      const folder = parts[parts.length - 2];
      await cloudinary.uploader.destroy(`${folder}/${filename}`);
    } catch (err) {
      console.warn(`Failed to delete Cloudinary image: ${url}`, err.message);
    }
  }

  await House.findOneAndDelete({ _id: houseId });
};
