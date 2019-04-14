process.env.NODE_PORT = 3009;
process.env.NODE_ENV = 'test';

jest.mock('pino', () => {
    const logger = {
        child() {
            return logger;
        },
        info() {},
        warn() {},
        error() {},
    };
    return () => {
        return logger;
    };
});
