import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";

export const validateBody = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    message: "خطأ في التحقق من البيانات",
                    errors: error.issues,
                });
            } else {
                next(error);
            }
        }
    };
};

export const validateParams = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.params);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    message: "خطأ في التحقق من البيانات",
                    errors: error.issues,
                });
            } else {
                next(error);
            }
        }
    };
};

export const validateQuery = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.query);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    message: "خطأ في التحقق من البيانات",
                    errors: error.issues,
                });
            } else {
                next(error);
            }
        }
    };
};
