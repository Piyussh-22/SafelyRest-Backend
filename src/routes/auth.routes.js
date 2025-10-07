import { body } from "express-validator";
import express from "express";
import {
  postLogin,
  postSignup,
  postLogout,
} from "../controllers/auth.controller.js";
import { postGoogleLogin } from "../controllers/auth.controller.js";

const authRoutes = express.Router();

// POST: Login
authRoutes.post("/login", postLogin);

// POST: Signup with validations
authRoutes.post(
  "/signup",
  [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
    body("userType")
      .isIn(["guest", "host"])
      .withMessage("User type must be guest or host"),
  ],
  postSignup
);

// POST: Logout
authRoutes.post("/logout", postLogout);

// Google Login
authRoutes.post("/google-login", postGoogleLogin);

export default authRoutes;
