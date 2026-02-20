export class Logger {
    static info(message: string) {
        console.log(`\x1b[36m[INFO] [${new Date().toISOString()}] ${message}\x1b[0m`);
    }

    static error(message: string, error?: any) {
        console.error(`\x1b[31m[ERROR] [${new Date().toISOString()}] ${message}\x1b[0m`);
        if (error) {
            console.error(error);
        }
    }

    static warn(message: string) {
        console.warn(`\x1b[33m[WARN] [${new Date().toISOString()}] ${message}\x1b[0m`);
    }

    static debug(message: string) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`\x1b[35m[DEBUG] [${new Date().toISOString()}] ${message}\x1b[0m`);
        }
    }
}
