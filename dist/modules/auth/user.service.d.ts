import { Request, Response, NextFunction } from "express";
declare class UserService {
    private userRepo;
    constructor();
    private formatValidationError;
    private generateToken;
    signup: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    confirmEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    logout: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updatePassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    forgetPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    resetPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
declare const _default: UserService;
export default _default;
//# sourceMappingURL=user.service.d.ts.map