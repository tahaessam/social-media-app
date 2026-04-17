import app from "./app.js";
import { PORT } from "./config/config.service.js";
import { Logger } from "./utils/logger.util.js";
const startServer = () => {
    app.listen(PORT, () => {
        Logger.info(`🚀 Social Media App started successfully`, {
            port: PORT,
            environment: process.env.NODE_ENV || "development",
            nodeVersion: process.version
        });
        console.log(`📍 Server URL: http://localhost:${PORT}`);
    });
};
export default startServer;
//# sourceMappingURL=server.js.map