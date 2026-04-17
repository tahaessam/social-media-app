import { Request, Response, NextFunction } from "express";
import { signupSchema, loginSchema } from "./user.validation.js";
import { ZodError } from "zod";

class UserService {
  constructor() {}

  // Helper method to format Zod errors
  private formatValidationError(error: ZodError) {
    return error.issues.map((issue: any) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  }

  signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body against schema
      const validatedData = signupSchema.parse(req.body);

      // TODO: حفظ المستخدم في قاعدة البيانات
      // const user = await User.create(validatedData);

      res.status(201).json({
        message: "تم التسجيل بنجاح",
        data: {
          email: validatedData.email,
          fullName: validatedData.fullName,
          // token: generateToken(user._id),
        },
      });
    } catch (error) {
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

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body against schema
      const validatedData = loginSchema.parse(req.body);

      // TODO: البحث عن المستخدم وتحقق من كلمة المرور
      // const user = await User.findOne({ email: validatedData.email });
      // if (!user || !user.matchPassword(validatedData.password))
      //   return res.status(401).json({ message: "بيانات غير صحيحة" });

      res.json({
        message: "تم تسجيل الدخول بنجاح",
        data: {
          email: validatedData.email,
          // token: generateToken(user._id),
        },
      });
    } catch (error) {
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

// el instance bta3ha 3shan ast5dmha fe el routes
export default new UserService();
