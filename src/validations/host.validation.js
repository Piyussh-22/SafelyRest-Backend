import { body } from "express-validator";

const VALID_AMENITIES = [
  "wifi",
  "parking",
  "ac",
  "heating",
  "kitchen",
  "tv",
  "pool",
  "gym",
];

export const addHouseValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 400, max: 1000 })
    .withMessage("Price must be between 400 and 1000 per day"),

  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required")
    .isLength({ max: 200 })
    .withMessage("Location cannot exceed 200 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 20, max: 1000 })
    .withMessage("Description must be between 20 and 1000 characters"),

  body("capacity")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("Capacity must be between 1 and 20"),

  body("amenities")
    .optional()
    .customSanitizer((value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      return value.split(",").map((a) => a.trim());
    })
    .custom((arr) => {
      const invalid = arr.filter((a) => !VALID_AMENITIES.includes(a));
      if (invalid.length > 0) {
        throw new Error(`Invalid amenities: ${invalid.join(", ")}`);
      }
      return true;
    }),
];
