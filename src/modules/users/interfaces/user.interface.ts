export interface IUser {
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