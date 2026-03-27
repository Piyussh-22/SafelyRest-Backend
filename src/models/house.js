import mongoose from "mongoose";
import { Favourite } from "./favourite.js";

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

const houseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: [400, "Price must be at least 400 per day"],
      max: [1000, "Price cannot exceed 1000 per day"],
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    photos: {
      type: [String],
      validate: [
        {
          validator: (arr) => arr.length >= 1,
          message: "At least 1 photo is required",
        },
        {
          validator: (arr) => arr.length <= 2,
          message: "Maximum 2 photos allowed",
        },
      ],
    },
    amenities: [
      {
        type: String,
        enum: VALID_AMENITIES,
      },
    ],
    capacity: {
      type: Number,
      min: [1, "Capacity must be at least 1"],
      max: [20, "Capacity cannot exceed 20"],
      default: 4,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const deleteFavourites = async function (houseId) {
  await Favourite.deleteMany({ houseId });
};

houseSchema.pre("findOneAndDelete", async function (next) {
  const houseId = this.getQuery()._id;
  await deleteFavourites(houseId);
  next();
});

houseSchema.index({ location: 1, price: 1 });
houseSchema.index({ owner: 1 });
houseSchema.index({ isAvailable: 1 });

export const House = mongoose.model("House", houseSchema);
