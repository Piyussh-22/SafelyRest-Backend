import { HTTP_STATUS } from "../constants/httpStatus.js";
import { MSG } from "../constants/messages.js";

export const errorHandler = (err, req, res, next) => {
  // Known, intentional error — safe to show message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Unexpected error — hide details in production
  console.error("💥 Unexpected error:", err);

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message:
      process.env.NODE_ENV === "production" ? MSG.INTERNAL_ERROR : err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
