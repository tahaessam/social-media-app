import { Router, Request } from "express";
import UserService from "./user.service";
import { validateBody } from "../../middlewares/validation";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import passport from "../../utils/passport.config";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: any;
}
import {
  signupSchema,
  loginSchema,
  updatePasswordSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  confirmEmailSchema,
  sendOtpSchema,
  verifyOtpSchema,
  resendOtpSchema,
} from "./user.validation";

const authRouter = Router();

authRouter.post("/signup", validateBody(signupSchema), UserService.signup);
authRouter.post("/confirm-email", validateBody(confirmEmailSchema), UserService.confirmEmail);
authRouter.post("/login", validateBody(loginSchema), UserService.login);
authRouter.post("/logout", authenticate, UserService.logout);
authRouter.put("/update-password", authenticate, validateBody(updatePasswordSchema), UserService.updatePassword);
authRouter.post("/forget-password", validateBody(forgetPasswordSchema), UserService.forgetPassword);
authRouter.post("/reset-password", validateBody(resetPasswordSchema), UserService.resetPassword);

// OTP routes
authRouter.post("/send-otp", validateBody(sendOtpSchema), UserService.sendOtp);
authRouter.post("/verify-otp", validateBody(verifyOtpSchema), UserService.verifyOtp);
authRouter.post("/resend-otp", validateBody(resendOtpSchema), UserService.resendOtp);

// Google OAuth routes
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
authRouter.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req: AuthRequest, res) => {
  const token = jwt.sign({ userId: (req.user as any)._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
});

export default authRouter;
