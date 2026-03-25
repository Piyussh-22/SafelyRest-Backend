import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { AppError } from "../utils/AppError.js";
import { MSG } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError(MSG.TOKEN_MISSING, HTTP_STATUS.UNAUTHORIZED));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(
        new AppError(MSG.USER_NOT_FOUND_TOKEN, HTTP_STATUS.UNAUTHORIZED),
      );
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new AppError(MSG.TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED));
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userType)) {
      return next(new AppError(MSG.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
    }
    next();
  };
};
