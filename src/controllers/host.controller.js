import { validationResult } from "express-validator";
import {
  fetchHostHouses,
  createHouse,
  removeHouse,
} from "../services/host.service.js";
import { AppError } from "../utils/AppError.js";
import { MSG } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

export const getHostHouses = async (req, res, next) => {
  try {
    const houses = await fetchHostHouses(req.user._id);
    return res.status(HTTP_STATUS.OK).json({ success: true, data: houses });
  } catch (err) {
    next(err);
  }
};

export const addHouse = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, HTTP_STATUS.UNPROCESSABLE));
  }

  try {
    if (!req.files?.length) {
      return next(new AppError(MSG.PHOTO_MIN, HTTP_STATUS.BAD_REQUEST));
    }

    const { name, price, location, description, amenities, capacity } =
      req.body;
    const photos = req.files.map((file) => file.path);

    const house = await createHouse({
      name,
      price,
      location,
      description,
      amenities: amenities || [],
      capacity: capacity ? Number(capacity) : 4,
      photos,
      ownerId: req.user._id,
    });

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: MSG.HOUSE_ADDED,
      data: house,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteHouse = async (req, res, next) => {
  try {
    await removeHouse(req.params.houseId, req.user._id);
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MSG.HOUSE_DELETED,
    });
  } catch (err) {
    next(err);
  }
};
