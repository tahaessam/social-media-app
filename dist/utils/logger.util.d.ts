export declare enum LogLevel {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    DEBUG = "DEBUG"
}
export declare class Logger {
    private static formatMessage;
    static info(message: string, meta?: any): void;
    static warn(message: string, meta?: any): void;
    static error(message: string, error?: Error | any): void;
    static debug(message: string, meta?: any): void;
}
//# sourceMappingURL=logger.util.d.ts.map