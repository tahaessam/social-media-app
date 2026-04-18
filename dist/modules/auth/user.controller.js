import { Router } from "express";
import UserService from "./user.service";
import { validateBody } from "../../middlewares/validation";
import { authenticate } from "../../middlewares/auth.middleware";
import passport from "../../utils/passport.config";
import jwt from "jsonwebtoken";
import { signupSchema, loginSchema, updatePasswordSchema, forgetPasswordSchema, resetPasswordSchema, confirmEmailSchema, } from "./user.validation";
const authRouter = Router();
authRouter.post("/signup", validateBody(signupSchema), UserService.signup);
authRouter.post("/confirm-email", validateBody(confirmEmailSchema), UserService.confirmEmail);
authRouter.post("/login", validateBody(loginSchema), UserService.login);
authRouter.post("/logout", authenticate, UserService.logout);
authRouter.put("/update-password", authenticate, validateBody(updatePasswordSchema), UserService.updatePassword);
authRouter.post("/forget-password", validateBody(forgetPasswordSchema), UserService.forgetPassword);
authRouter.post("/reset-password", validateBody(resetPasswordSchema), UserService.resetPassword);
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
authRouter.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
});
export default authRouter;
//# sourceMappingURL=user.controller.js.map