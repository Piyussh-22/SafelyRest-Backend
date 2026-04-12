// Defines the Booking model to store reservations between users and houses with validation, status tracking, and indexing.
import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  guest: mongoose.Types.ObjectId;
  house: mongoose.Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "rejected" | "cancelled";
  message?: string;
}

const bookingSchema = new Schema<IBooking>(
  {
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true,
    },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: {
      type: Number,
      required: true,
      min: [1, "At least 1 guest is required"],
      max: [10, "Maximum 10 guests allowed"],
    },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "cancelled"],
      default: "pending",
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
  },
  { timestamps: true },
);

bookingSchema.index({ guest: 1, house: 1, checkIn: 1 });

export const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
