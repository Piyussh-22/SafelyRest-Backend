// Protect routes by verifying JWT and attaching user; restrict access based on user roles.
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/user.js";
import { AppError } from "../utils/AppError.js";
import { MSG } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError(MSG.TOKEN_MISSING, HTTP_STATUS.UNAUTHORIZED));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    // @ts-ignore
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(
        new AppError(MSG.USER_NOT_FOUND_TOKEN, HTTP_STATUS.UNAUTHORIZED),
      );
    }

    (req as any).user = user;
    next();
  } catch (err) {
    return next(new AppError(MSG.TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED));
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes((req as any).user.userType)) {
      return next(new AppError(MSG.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
    }
    next();
  };
};
