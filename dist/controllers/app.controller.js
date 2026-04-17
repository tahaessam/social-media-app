export class AppController {
    ping(req, res) {
        res.json({ ok: true, timestamp: new Date().toISOString() });
    }
    getHello(req, res) {
        res.status(200).json({
            message: "Hello to social app",
            version: "1.0.0",
            timestamp: new Date().toISOString()
        });
    }
    testError(req, res, next) {
        const error = new Error("This is a test error for demonstration purposes");
        next(error);
    }
    getStatus(req, res) {
        res.json({
            status: "running",
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.version
        });
    }
}
export const appController = new AppController();
//# sourceMappingURL=app.controller.js.map