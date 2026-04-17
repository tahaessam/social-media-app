import { signupSchema, loginSchema } from "./user.validation.js";
import { ZodError } from "zod";
class UserService {
    constructor() { }
    formatValidationError(error) {
        return error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));
    }
    signup = async (req, res, next) => {
        try {
            const validatedData = signupSchema.parse(req.body);
            res.status(201).json({
                message: "تم التسجيل بنجاح",
                data: {
                    email: validatedData.email,
                    fullName: validatedData.fullName,
                },
            });
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    message: "خطأ في التحقق من البيانات",
                    errors: this.formatValidationError(error),
                });
                return;
            }
            next(error);
        }
    };
    login = async (req, res, next) => {
        try {
            const validatedData = loginSchema.parse(req.body);
            res.json({
                message: "تم تسجيل الدخول بنجاح",
                data: {
                    email: validatedData.email,
                },
            });
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    message: "خطأ في التحقق من البيانات",
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