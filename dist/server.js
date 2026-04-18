import app from "./app.js";
import { PORT } from "./config/config.service.js";
import { Logger } from "./utils/logger.util.js";
import { connectDB } from "./DB/connectionDB.js";
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            Logger.info(`🚀 Social Media App started successfully`, {
                port: PORT,
                environment: process.env.NODE_ENV || "development",
                nodeVersion: process.version
            });
            console.log(`📍 Server URL: http://localhost:${PORT}`);
        });
    }
    catch (error) {
        Logger.error("Failed to start server", { error });
        process.exit(1);
    }
};
export default startServer;
//# sourceMappingURL=server.js.map