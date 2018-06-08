import { IRouterContext } from 'koa-router';
import { ILogger } from '../logger';

export function createTestContext(userId = 'apalchys'): IRouterContext {
    return {
        request: {
            body: undefined,
        },
        state: {
            user: {
                _id: userId,
            },
        },
    } as any;
}

export function getLoggerMock() {
    const logger: ILogger = {
        child: jest.fn(() => logger),
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
    };
    return logger;
}
