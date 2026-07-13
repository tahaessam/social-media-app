import http from "http";
import app from "./app.js";
import { PORT } from "./config/config.service.js";
import { Logger } from "./common/utils/logger.util.js";
import { connectDB } from "./common/database/connection.js";
import { attachSocketServer } from "./common/sockets/socket.server.js";

const startServer = async () => {
  try {
    await connectDB();
    const server = http.createServer(app);
    attachSocketServer(server);
    server.listen(PORT, () => {
      Logger.info(`🚀 Social Media App started successfully`, {
        port: PORT,
        environment: process.env.NODE_ENV || "development",
        nodeVersion: process.version,
      });
      console.log(`📍 Server URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    Logger.error("Failed to start server", error);
    process.exit(1);
  }
};

export default startServer;
