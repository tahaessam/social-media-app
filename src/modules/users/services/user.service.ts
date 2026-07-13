import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ZodError } from "zod";
import UserRepo from "../repositories/user.repository.js";
import type { IMailProvider } from "../../../common/email/mail.interface.js";
import mailProvider from "../../../common/utils/email.service.js";
import type { ICacheProvider } from "../../../common/cache/cache.interface.js";
import cacheProvider from "../../../common/utils/redis.service.js";
import {
  signupSchema,
  loginSchema,
  updatePasswordSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  confirmEmailSchema,
  registerDeviceTokenSchema,
  sendOtpSchema,
  verifyOtpSchema,
  resendOtpSchema,
} from "../validations/user.validation.js";

class UserService {
  constructor(
    private readonly mailProvider: IMailProvider,
    private readonly cacheProvider: ICacheProvider,
    private readonly userRepo: UserRepo = new UserRepo(),
  ) {}

  private formatValidationError(error: ZodError) {
    return error.issues.map((issue: any) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  }

  private generateToken(user: any) {
    return jwt.sign(
      { userId: user._id.toString(), role: user.role, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );
  }

  signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = signupSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      const verificationToken = crypto.randomBytes(32).toString("hex");

      const user = await this.userRepo.create({
        ...validatedData,
        password: hashedPassword,
        verificationToken,
        isVerified: true,
      });

      const token = this.generateToken(user);
      await this.cacheProvider.set(`session:${user._id}`, token, 604800);

      await this.mailProvider.sendMail(
        user.email,
        "Welcome",
        `Welcome to the chat app, ${user.fullName}!`,
      );

      res.status(201).json({
        message: "User registered successfully",
        data: {
          id: user._id.toString(),
          email: user.email,
          fullName: user.fullName,
          token,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation error",
          errors: this.formatValidationError(error),
        });
        return;
      }
      if ((error as any).code === 11000) {
        res.status(409).json({ message: "Email already exists" });
        return;
      }
      next(error);
    }
  };

  confirmEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = confirmEmailSchema.parse(req.body);
      const user = await this.userRepo.findOne({ verificationToken: token });
      if (!user) {
        const error = new Error("Invalid token");
        (error as any).statusCode = 400;
        next(error);
        return;
      }

      user.isVerified = true;
      delete user.verificationToken;
      await user.save();

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation error",
          errors: this.formatValidationError(error),
        });
        return;
      }
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await this.userRepo.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        const error = new Error("Invalid credentials");
        (error as any).statusCode = 401;
        next(error);
        return;
      }
      if (!user.isVerified) {
        const error = new Error("Please verify your email first");
        (error as any).statusCode = 403;
        next(error);
        return;
      }

      const token = this.generateToken(user);
      await this.cacheProvider.set(`session:${user._id}`, token, 604800);

      res.json({
        message: "Login successful",
        data: {
          id: user._id.toString(),
          email: user.email,
          fullName: user.fullName,
          token,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation error",
          errors: this.formatValidationError(error),
        });
        return;
      }
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (token) {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        await this.cacheProvider.del(`session:${decoded.userId}`);
      }
      res.json({ message: "Logout successful" });
    } catch (error) {
      next(error);
    }
  };

  registerDeviceToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fcmToken } = registerDeviceTokenSchema.parse(req.body);
      const userId = (req as any).user?.userId;
      const user = await this.userRepo.findById(userId);

      if (!user) {
        const error = new Error("User not found");
        (error as any).statusCode = 404;
        next(error);
        return;
      }

      user.fcmToken = fcmToken;
      await user.save();

      res.json({ message: "Device token registered successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation error",
          errors: this.formatValidationError(error),
        });
        return;
      }
      next(error);
    }
  };

  unregisterDeviceToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const user = await this.userRepo.findById(userId);

      if (!user) {
        const error = new Error("User not found");
        (error as any).statusCode = 404;
        next(error);
        return;
      }

      delete user.fcmToken;
      await user.save();

      res.json({ message: "Device token unregistered successfully" });
    } catch (error) {
      next(error);
    }
  };

  updatePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { oldPassword, newPassword } = updatePasswordSchema.parse(req.body);
      const user = await this.userRepo.findById((req as any).user.userId);
      if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
        const error = new Error("Invalid old password");
        (error as any).statusCode = 400;
        next(error);
        return;
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation error",
          errors: this.formatValidationError(error),
        });
        return;
      }
      next(error);
    }
  };

  forgetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = forgetPasswordSchema.parse(req.body);
      const user = await this.userRepo.findOne({ email });
      if (!user) {
        const error = new Error("User not found");
        (error as any).statusCode = 404;
        next(error);
        return;
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 3600000);
      await user.save();

      await this.mailProvider.sendMail(
        user.email,
        "Reset your password",
        `Click here to reset: ${process.env.BASE_URL}/auth/reset-password?token=${resetToken}`
      );

      res.json({ message: "Password reset email sent" });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation error",
          errors: this.formatValidationError(error),
        });
        return;
      }
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(req.body);
      const user = await this.userRepo.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });
      if (!user) {
        const error = new Error("Invalid or expired token");
        (error as any).statusCode = 400;
        next(error);
        return;
      }

      user.password = await bcrypt.hash(newPassword, 10);
      delete user.resetPasswordToken;
      delete user.resetPasswordExpires;
      await user.save();

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation error",
          errors: this.formatValidationError(error),
        });
        return;
      }
      next(error);
    }
  };

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = sendOtpSchema.parse(req.body);
      const user = await this.userRepo.findOne({ email });
      if (!user) {
        const error = new Error("User not found");
        (error as any).statusCode = 404;
        next(error);
        return;
      }

      const otp = this.generateOtp();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();

      await this.mailProvider.sendMail(
        user.email,
        "Your OTP Code",
        `Your OTP code is: ${otp}\n\nThis code will expire in 10 minutes.`
      );

      res.json({ message: "OTP sent successfully to your email" });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation error",
          errors: this.formatValidationError(error),
        });
        return;
      }
      next(error);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, otp } = verifyOtpSchema.parse(req.body);
      const user = await this.userRepo.findOne({ email });
      if (!user) {
        const error = new Error("User not found");
        (error as any).statusCode = 404;
        next(error);
        return;
      }

      if (!user.otp || user.otp !== otp) {
        const error = new Error("Invalid OTP");
        (error as any).statusCode = 400;
        next(error);
        return;
      }

      if (!user.otpExpires || user.otpExpires < new Date()) {
        const error = new Error("OTP has expired");
        (error as any).statusCode = 400;
        next(error);
        return;
      }

      delete user.otp;
      delete user.otpExpires;
      user.isVerified = true;
      await user.save();

      const token = this.generateToken(user);

      res.json({
        message: "OTP verified successfully",
        data: { email: user.email, fullName: user.fullName, token },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation error",
          errors: this.formatValidationError(error),
        });
        return;
      }
      next(error);
    }
  };

  resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = resendOtpSchema.parse(req.body);
      const user = await this.userRepo.findOne({ email });
      if (!user) {
        const error = new Error("User not found");
        (error as any).statusCode = 404;
        next(error);
        return;
      }

      const otp = this.generateOtp();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();

      await this.mailProvider.sendMail(
        user.email,
        "Your OTP Code (Resend)",
        `Your new OTP code is: ${otp}\n\nThis code will expire in 10 minutes.`
      );

      res.json({ message: "OTP resent successfully to your email" });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation error",
          errors: this.formatValidationError(error),
        });
        return;
      }
      next(error);
    }
  };

  findByEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const email = String(req.query.email || "").trim();
      if (!email) {
        res.status(400).json({ message: "email query is required" });
        return;
      }

      const user = await this.userRepo.findOne({
        email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.json({
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        isOnline: user.isOnline || false,
      });
    } catch (error) {
      next(error);
    }
  };

  listUsers = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const users = await this.userRepo.find({}, { password: 0, otp: 0, resetPasswordToken: 0, resetPasswordExpires: 0 });
      res.json(users.map((user: any) => ({
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified,
        isOnline: user.isOnline || false,
      })));
    } catch (error) {
      next(error);
    }
  };
}

export default new UserService(mailProvider, cacheProvider);
