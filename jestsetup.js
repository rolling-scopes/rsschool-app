jest.mock('bunyan', () => {
    const logger = {
        child() {
            return logger;
        },
        info() {},
        warn() {},
        error() {},
    };
    return {
        createLogger: () => {
            return logger;
        },
    };
});
