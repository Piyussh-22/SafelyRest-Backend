import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema(
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
  { timestamps: true }
);

// Ensure one user cannot favorite the same house twice
favouriteSchema.index({ userId: 1, houseId: 1 }, { unique: true });

export const Favourite = mongoose.model("Favourite", favouriteSchema);
