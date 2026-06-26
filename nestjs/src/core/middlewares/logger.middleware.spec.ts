import { Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LoggingMiddleware } from './logger.middleware';

type FinishListener = () => void;

describe('LoggingMiddleware', () => {
  let middleware: LoggingMiddleware;
  let logSpy: ReturnType<typeof vi.spyOn>;
  let next: NextFunction;
  let finishListener: FinishListener | undefined;
  let res: Response;

  const buildRes = (statusCode = 200): Response => {
    finishListener = undefined;
    return {
      statusCode,
      on: vi.fn((event: string, cb: FinishListener) => {
        if (event === 'finish') finishListener = cb;
      }),
    } as Partial<Response> as Response;
  };

  const buildReq = (overrides: Partial<Request> = {}): Request =>
    ({
      url: '/api/courses',
      query: { page: '1' },
      method: 'GET',
      ...overrides,
    }) as Partial<Request> as Request;

  beforeEach(() => {
    middleware = new LoggingMiddleware();
    // Logger.prototype.log is shared across instances, so spying on the prototype
    // captures the call made by the middleware's private logger.
    logSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    next = vi.fn();
    res = buildRes();
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('registers a finish listener on the response', () => {
    middleware.use(buildReq(), res, next);

    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
  });

  it('calls next()', () => {
    middleware.use(buildReq(), res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('does not log until the response finishes', () => {
    middleware.use(buildReq(), res, next);

    expect(logSpy).not.toHaveBeenCalled();
  });

  it('logs request metadata when the response finishes', () => {
    res = buildRes(201);
    const req = buildReq({ url: '/api/x', method: 'POST', query: { a: 'b' } });

    middleware.use(req, res, next);
    finishListener?.();

    expect(logSpy).toHaveBeenCalledTimes(1);
    const payload = logSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(payload).toMatchObject({
      msg: 'Processed request',
      url: '/api/x',
      query: { a: 'b' },
      method: 'POST',
      status: 201,
      userId: null,
    });
    expect(typeof payload.duration).toBe('number');
    expect(payload.duration as number).toBeGreaterThanOrEqual(0);
  });

  it('includes the user id when a user is attached to the request', () => {
    const req = buildReq();
    (req as Request & { user: { id: number } }).user = { id: 42 };

    middleware.use(req, res, next);
    finishListener?.();

    const payload = logSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.userId).toBe(42);
  });

  it('falls back to null userId when there is no user', () => {
    middleware.use(buildReq(), res, next);
    finishListener?.();

    const payload = logSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.userId).toBeNull();
  });
});
