import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true },
    userType: {
      type: String,
      enum: ["guest", "host", "admin"],
      default: "guest",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
