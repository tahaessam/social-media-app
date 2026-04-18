import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ZodError } from "zod";
import UserRepo from "./user.repo";
import EmailService from "../../utils/email.service";
import RedisService from "../../utils/redis.service";
import { signupSchema, loginSchema, updatePasswordSchema, forgetPasswordSchema, resetPasswordSchema, confirmEmailSchema, } from "./user.validation";
class UserService {
    userRepo;
    constructor() {
        this.userRepo = new UserRepo();
    }
    formatValidationError(error) {
        return error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));
    }
    generateToken(userId) {
        return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
    }
    signup = async (req, res, next) => {
        try {
            const validatedData = signupSchema.parse(req.body);
            const hashedPassword = await bcrypt.hash(validatedData.password, 10);
            const verificationToken = crypto.randomBytes(32).toString("hex");
            const user = await this.userRepo.create({
                ...validatedData,
                password: hashedPassword,
                verificationToken,
            });
            await EmailService.sendEmail(user.email, "Verify your email", `Click here to verify: ${process.env.BASE_URL}/auth/confirm-email?token=${verificationToken}`);
            res.status(201).json({
                message: "User registered successfully. Please check your email to verify.",
                data: { email: user.email, fullName: user.fullName },
            });
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    message: "Validation error",
                    errors: this.formatValidationError(error),
                });
                return;
            }
            if (error.code === 11000) {
                res.status(409).json({ message: "Email already exists" });
                return;
            }
            next(error);
        }
    };
    confirmEmail = async (req, res, next) => {
        try {
            const { token } = confirmEmailSchema.parse(req.body);
            const user = await this.userRepo.findOne({ verificationToken: token });
            if (!user) {
                const error = new Error("Invalid token");
                error.statusCode = 400;
                next(error);
                return;
            }
            user.isVerified = true;
            user.verificationToken = undefined;
            await user.save();
            res.json({ message: "Email verified successfully" });
        }
        catch (error) {
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
    login = async (req, res, next) => {
        try {
            const { email, password } = loginSchema.parse(req.body);
            const user = await this.userRepo.findOne({ email });
            if (!user || !(await bcrypt.compare(password, user.password))) {
                const error = new Error("Invalid credentials");
                error.statusCode = 401;
                next(error);
                return;
            }
            if (!user.isVerified) {
                const error = new Error("Please verify your email first");
                error.statusCode = 403;
                next(error);
                return;
            }
            const token = this.generateToken(user._id.toString());
            await RedisService.set(`session:${user._id}`, token, 604800);
            res.json({
                message: "Login successful",
                data: { email: user.email, fullName: user.fullName, token },
            });
        }
        catch (error) {
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
    logout = async (req, res, next) => {
        try {
            const token = req.header("Authorization")?.replace("Bearer ", "");
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                await RedisService.del(`session:${decoded.userId}`);
            }
            res.json({ message: "Logout successful" });
        }
        catch (error) {
            next(error);
        }
    };
    updatePassword = async (req, res, next) => {
        try {
            const { oldPassword, newPassword } = updatePasswordSchema.parse(req.body);
            const user = await this.userRepo.findById(req.user.userId);
            if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
                const error = new Error("Invalid old password");
                error.statusCode = 400;
                next(error);
                return;
            }
            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();
            res.json({ message: "Password updated successfully" });
        }
        catch (error) {
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
    forgetPassword = async (req, res, next) => {
        try {
            const { email } = forgetPasswordSchema.parse(req.body);
            const user = await this.userRepo.findOne({ email });
            if (!user) {
                const error = new Error("User not found");
                error.statusCode = 404;
                next(error);
                return;
            }
            const resetToken = crypto.randomBytes(32).toString("hex");
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = new Date(Date.now() + 3600000);
            await user.save();
            await EmailService.sendEmail(user.email, "Reset your password", `Click here to reset: ${process.env.BASE_URL}/auth/reset-password?token=${resetToken}`);
            res.json({ message: "Password reset email sent" });
        }
        catch (error) {
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
    resetPassword = async (req, res, next) => {
        try {
            const { token, newPassword } = resetPasswordSchema.parse(req.body);
            const user = await this.userRepo.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: new Date() },
            });
            if (!user) {
                const error = new Error("Invalid or expired token");
                error.statusCode = 400;
                next(error);
                return;
            }
            user.password = await bcrypt.hash(newPassword, 10);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            res.json({ message: "Password reset successfully" });
        }
        catch (error) {
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
}
export default new UserService();
//# sourceMappingURL=user.service.js.map