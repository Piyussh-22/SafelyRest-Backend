//Ensures booking inputs (dates, guests, etc.) are valid and follow business constraints like date ranges and stay limits.
import { body } from "express-validator";

const IST_OFFSET = 5.5 * 60 * 60 * 1000;

const getISTMidnight = (date) => {
  const ist = new Date(date.getTime() + IST_OFFSET);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - IST_OFFSET);
};

const todayIST = () => getISTMidnight(new Date());

export const bookingValidation = [
  body("houseId").notEmpty().withMessage("House ID is required"),

  body("checkIn")
    .notEmpty()
    .withMessage("Check-in date is required")
    .isISO8601()
    .withMessage("Check-in must be a valid date")
    .custom((value) => {
      const checkIn = getISTMidnight(new Date(value));
      const today = todayIST();

      if (checkIn < today) {
        throw new Error("Check-in date cannot be in the past");
      }

      const maxCheckIn = new Date(today);
      maxCheckIn.setMonth(maxCheckIn.getMonth() + 1);

      if (checkIn > maxCheckIn) {
        throw new Error("Check-in date cannot be more than 1 month from today");
      }

      return true;
    }),

  body("checkOut")
    .notEmpty()
    .withMessage("Check-out date is required")
    .isISO8601()
    .withMessage("Check-out must be a valid date")
    .custom((value, { req }) => {
      if (!req.body.checkIn || isNaN(new Date(req.body.checkIn).getTime())) {
        return true; // checkIn validator will handle this
      }
      const checkOut = getISTMidnight(new Date(value));
      const checkIn = getISTMidnight(new Date(req.body.checkIn));

      if (checkOut <= checkIn) {
        throw new Error("Check-out must be after check-in");
      }

      const maxCheckOut = new Date(checkIn);
      maxCheckOut.setDate(maxCheckOut.getDate() + 10);

      if (checkOut > maxCheckOut) {
        throw new Error("Maximum stay is 10 days");
      }

      return true;
    }),

  body("guests")
    .notEmpty()
    .withMessage("Number of guests is required")
    .isInt({ min: 1, max: 10 })
    .withMessage("Guests must be between 1 and 10"),

  body("message")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Message cannot exceed 500 characters"),
];
