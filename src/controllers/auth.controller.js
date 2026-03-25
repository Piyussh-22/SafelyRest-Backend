import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.js";
import { signToken } from "../utils/token.js";
import { AppError } from "../utils/AppError.js";
import { MSG } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const formatUser = (user) => ({
  id: user._id,
  name: user.firstName,
  email: user.email,
  role: user.userType,
});

// POST /auth/signup
export const postSignup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, HTTP_STATUS.UNPROCESSABLE));
  }

  try {
    const { firstName, email, password, userType } = req.body;
    const emailNormalized = email.toLowerCase();

    const existing = await User.findOne({ email: emailNormalized });
    if (existing) {
      return next(new AppError(MSG.EMAIL_TAKEN, HTTP_STATUS.CONFLICT));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      firstName,
      email: emailNormalized,
      password: hashedPassword,
      userType,
    });

    const token = signToken(newUser);

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: MSG.SIGNUP_SUCCESS,
      token,
      user: formatUser(newUser),
    });
  } catch (err) {
    next(err);
  }
};

// POST /auth/login
export const postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const emailNormalized = email.toLowerCase();

    const user = await User.findOne({ email: emailNormalized }).select(
      "+password",
    );

    if (!user || !user.password) {
      return next(
        new AppError(MSG.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED),
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(
        new AppError(MSG.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED),
      );
    }

    const token = signToken(user);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MSG.LOGIN_SUCCESS,
      token,
      user: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// POST /auth/logout
export const postLogout = (_req, res) => {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: MSG.LOGOUT_SUCCESS,
  });
};

// POST /auth/google-login
export const postGoogleLogin = async (req, res, next) => {
  try {
    const { idToken, userType } = req.body;

    if (!idToken) {
      return next(
        new AppError(MSG.GOOGLE_TOKEN_MISSING, HTTP_STATUS.BAD_REQUEST),
      );
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return next(
        new AppError(MSG.GOOGLE_TOKEN_INVALID, HTTP_STATUS.BAD_REQUEST),
      );
    }
    if (!payload.email_verified) {
      return next(
        new AppError(MSG.GOOGLE_EMAIL_UNVERIFIED, HTTP_STATUS.BAD_REQUEST),
      );
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const firstName =
      payload.given_name || (payload.name || "").split(" ")[0] || "";

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        if (!user.firstName) user.firstName = firstName;
        await user.save();
      } else {
        user = await User.create({
          firstName,
          email,
          googleId,
          userType: userType || "guest",
        });
      }
    }

    const token = signToken(user);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MSG.GOOGLE_LOGIN_SUCCESS,
      token,
      user: formatUser(user),
    });
  } catch (err) {
    next(
      new AppError(MSG.GOOGLE_LOGIN_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR),
    );
  }
};
