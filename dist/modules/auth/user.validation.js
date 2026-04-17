import { z } from "zod";
export const signupSchema = z.object({
    email: z
        .string()
        .email("البريد الإلكتروني غير صحيح")
        .min(1, "البريد الإلكتروني مطلوب"),
    password: z
        .string()
        .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")
        .regex(/[A-Z]/, "كلمة المرور يجب أن تحتوي على حرف كبير")
        .regex(/[0-9]/, "كلمة المرور يجب أن تحتوي على رقم"),
    fullName: z
        .string()
        .min(2, "الاسم يجب أن يكون حرفين على الأقل")
        .max(50, "الاسم يجب أن يكون 50 حرف كحد أقصى"),
});
export const loginSchema = z.object({
    email: z
        .string()
        .email("البريد الإلكتروني غير صحيح")
        .min(1, "البريد الإلكتروني مطلوب"),
    password: z
        .string()
        .min(1, "كلمة المرور مطلوبة"),
});
//# sourceMappingURL=user.validation.js.map