import { Request, Response, NextFunction } from "express";
export declare class AppController {
    ping(req: Request, res: Response): void;
    getHello(req: Request, res: Response): void;
    testError(req: Request, res: Response, next: NextFunction): void;
    getStatus(req: Request, res: Response): void;
}
export declare const appController: AppController;
//# sourceMappingURL=app.controller.d.ts.map