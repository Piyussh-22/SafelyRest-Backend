import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import { OAuth2Client } from "google-auth-library";
import { signToken } from "../utils/token.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST: Signup a new user
export const postSignup = async (req, res) => {
  const { firstName, email, password, userType } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  try {
    const emailNormalized = email.toLowerCase();
    const existingUser = await User.findOne({ email: emailNormalized });
    if (existingUser) {
      return res.status(422).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      firstName,
      email: emailNormalized,
      password: hashedPassword,
      userType,
    });

    const token = signToken(newUser);

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.firstName,
        role: newUser.userType,
      },
    });
  } catch (err) {
    console.error("POST /auth/signup error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// POST: Login user (normal + hardcoded admin)
export const postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const emailNormalized = email.toLowerCase();

    // Hardcoded single admin login
    if (
      emailNormalized === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const adminUser = {
        _id: "admin-id",
        firstName: "Admin",
        email: emailNormalized,
        userType: "admin",
      };

      const token = signToken(adminUser, { expiresIn: "7d" });
      return res.json({
        success: true,
        message: "Admin login successful",
        token,
        user: {
          id: adminUser._id,
          name: adminUser.firstName,
          role: adminUser.userType,
        },
      });
    }

    // Normal user login
    const user = await User.findOne({ email: emailNormalized }).select(
      "+password"
    );
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = signToken(user, { expiresIn: "7d" });

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.firstName,
        role: user.userType,
      },
    });
  } catch (err) {
    console.error("POST /auth/login error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// POST: Logout (JWT handled on client side)
export const postLogout = (req, res) => {
  return res.json({ success: true, message: "Logged out successfully" });
};

// POST: Google login
export const postGoogleLogin = async (req, res) => {
  try {
    const { idToken, userType } = req.body;
    if (!idToken) return res.status(400).json({ message: "idToken missing" });

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload)
      return res.status(400).json({ message: "Invalid Google token" });
    if (!payload.email_verified)
      return res.status(400).json({ message: "Google email not verified" });

    const googleId = payload.sub;
    const email = payload.email.toLowerCase(); // normalize email
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

    const token = signToken(user, { expiresIn: "7d" });
    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.firstName,
        role: user.userType,
      },
    });
  } catch (err) {
    console.error("POST /auth/google-login error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Google login failed" });
  }
};
