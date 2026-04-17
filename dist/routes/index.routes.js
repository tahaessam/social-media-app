import { Router } from "express";
import { appController } from "../controllers/app.controller.js";
const router = Router();
router.get("/ping", appController.ping);
router.get("/", appController.getHello);
router.get("/test-error", appController.testError);
router.use((req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
});
export { router as indexRoutes };
//# sourceMappingURL=index.routes.js.map