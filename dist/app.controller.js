import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { PORT } from "./config/config.service.js";
const app = express();
const bootstrap = () => {
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: "Too many requests from this IP, please try again after 15 minutes",
        handler: (req, res) => {
            res.status(429).json({
                error: "Too many requests from this IP, please try again after 15 minutes",
            });
        },
        legacyHeaders: false,
    });
    app.use(express.json());
    app.use(cors());
    app.use(helmet());
    app.use(limiter);
    app.get("/", (req, res) => {
        res.status(200).json({ message: "Hello to social app" });
    });
    app.get("/test-error", (req, res, next) => {
        const error = new Error("This is a test error");
        next(error);
    });
    app.use((req, res) => {
        res.status(404).json({ message: "url not found" });
    });
    app.use((err, req, res, next) => {
        console.error(err.stack || err.message);
        res.status(500).json({
            message: "Internal Server Error",
        });
    });
    app.listen(PORT, () => {
        console.log(`app listening on port ${PORT}`);
    });
};
export default bootstrap;
