import { z } from "zod";
export const signupSchema = z.object({
    email: z.string().email().min(1),
    password: z.string().min(6).regex(/[A-Z]/).regex(/[0-9]/),
    fullName: z.string().min(2).max(50),
});
export const loginSchema = z.object({
    email: z.string().email().min(1),
    password: z.string().min(1),
});
export const updatePasswordSchema = z.object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(6).regex(/[A-Z]/).regex(/[0-9]/),
});
export const forgetPasswordSchema = z.object({
    email: z.string().email().min(1),
});
export const resetPasswordSchema = z.object({
    token: z.string().min(1),
    newPassword: z.string().min(6).regex(/[A-Z]/).regex(/[0-9]/),
});
export const confirmEmailSchema = z.object({
    token: z.string().min(1),
});
//# sourceMappingURL=user.validation.js.map