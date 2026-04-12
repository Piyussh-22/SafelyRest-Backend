//Handles all application errors, sending safe responses for known errors and generic responses for unexpected ones.
import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { MSG } from "../constants/messages.js";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  console.error("💥 Unexpected error:", err);

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message:
      process.env.NODE_ENV === "production" ? MSG.INTERNAL_ERROR : err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
