//Checks incoming signup request for valid email, password rules, matching passwords, and allowed user roles.
import { body } from "express-validator";

export const signupValidation = [
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
];
