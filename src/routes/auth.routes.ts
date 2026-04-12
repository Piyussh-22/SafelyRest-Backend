// Defines authentication routes: signup, login, logout, and Google OAuth login.
import express from "express";
import {
  postLogin,
  postSignup,
  postLogout,
  postGoogleLogin,
} from "../controllers/auth.controller.js";
import { signupValidation } from "../validations/auth.validation.js";

const authRoutes = express.Router();

authRoutes.post("/login", postLogin);
authRoutes.post("/signup", signupValidation, postSignup);
authRoutes.post("/logout", postLogout);
authRoutes.post("/google-login", postGoogleLogin);

export default authRoutes;
