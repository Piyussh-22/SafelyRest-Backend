import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🟢 Connected to MongoDB with Mongoose");
  } catch (err) {
    console.error("🔴 Error while connecting to MongoDB:", err.message);
    throw err;
  }
};
