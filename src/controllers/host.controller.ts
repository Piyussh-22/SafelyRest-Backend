// Handles host house management (view, add, delete) with validation, file handling, and user-based ownership, ensuring only hosts control their property listings.
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import {
  fetchHostHouses,
  createHouse,
  removeHouse,
} from "../services/host.service.js";
import { AppError } from "../utils/AppError.js";
import { MSG } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

export const getHostHouses = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const houses = await fetchHostHouses((req as any).user._id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: houses });
  } catch (err) {
    next(err);
  }
};

export const addHouse = async (
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
    if (!(req as any).files?.length) {
      return next(new AppError(MSG.PHOTO_MIN, HTTP_STATUS.BAD_REQUEST));
    }

    const { name, price, location, description, amenities, capacity } =
      req.body;
    const photos = (req as any).files.map((file: any) => file.path);

    const house = await createHouse({
      name,
      price,
      location,
      description,
      amenities: amenities || [],
      capacity: capacity ? Number(capacity) : 4,
      photos,
      ownerId: (req as any).user._id,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: MSG.HOUSE_ADDED,
      data: house,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteHouse = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await removeHouse(req.params.houseId as string, (req as any).user._id);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MSG.HOUSE_DELETED,
    });
  } catch (err) {
    next(err);
  }
};
