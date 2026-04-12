// Connect backend to MongoDB using Mongoose and handles connection success or failure.

import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🟢 Connected to MongoDB");
  } catch (err: any) {
    console.error("🔴 MongoDB connection error:", err.message);
    throw err;
  }
};
