import { Request, Response, NextFunction } from "express";
declare class UserService {
    constructor();
    private formatValidationError;
    signup: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
declare const _default: UserService;
export default _default;
//# sourceMappingURL=user.service.d.ts.map