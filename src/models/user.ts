// Defines the User model schema and TypeScript types for storing and managing users in MongoDB using Mongoose.
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  email: string;
  password?: string;
  googleId?: string;
  userType: "guest" | "host" | "admin";
}

const userSchema = new Schema<IUser>(
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
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User;
