// Defines a Favourite model to store which users saved which houses, with a unique constraint to prevent duplicates.
import mongoose, { Document, Schema } from "mongoose";

export interface IFavourite extends Document {
  userId: mongoose.Types.ObjectId;
  houseId: mongoose.Types.ObjectId;
  savedAt: Date;
}

const favouriteSchema = new Schema<IFavourite>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    houseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "House",
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

favouriteSchema.index({ userId: 1, houseId: 1 }, { unique: true });

export const Favourite = mongoose.model<IFavourite>(
  "Favourite",
  favouriteSchema,
);
