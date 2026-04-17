export var LogLevel;
(function (LogLevel) {
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["DEBUG"] = "DEBUG";
})(LogLevel || (LogLevel = {}));
export class Logger {
    static formatMessage(level, message, meta) {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` | ${JSON.stringify(meta)}` : "";
        return `[${timestamp}] ${level}: ${message}${metaStr}`;
    }
    static info(message, meta) {
        console.log(this.formatMessage(LogLevel.INFO, message, meta));
    }
    static warn(message, meta) {
        console.warn(this.formatMessage(LogLevel.WARN, message, meta));
    }
    static error(message, error) {
        const meta = error
            ? { error: error.message, stack: error.stack }
            : undefined;
        console.error(this.formatMessage(LogLevel.ERROR, message, meta));
    }
    static debug(message, meta) {
        if (process.env.NODE_ENV === "development") {
            console.debug(this.formatMessage(LogLevel.DEBUG, message, meta));
        }
    }
}
//# sourceMappingURL=logger.util.js.map