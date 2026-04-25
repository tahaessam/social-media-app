import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  isVerified: boolean;
  verificationToken?: string;
  otp?: string;
  otpExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  role: string;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    otp: String,
    otpExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    googleId: String,
    role: {
      type: String,
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;