import { CallHandler, ExecutionContext, Logger } from '@nestjs/common';
import { of } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

type FinishListener = () => void;

type RawRes = { statusCode: number; on: ReturnType<typeof vi.fn> };

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let logSpy: ReturnType<typeof vi.spyOn>;
  let finishListener: FinishListener | undefined;
  const next: CallHandler = { handle: () => of('handler-result') };

  const buildRawRes = (statusCode = 200): RawRes => {
    finishListener = undefined;
    return {
      statusCode,
      on: vi.fn((event: string, cb: FinishListener) => {
        if (event === 'finish') finishListener = cb;
      }),
    };
  };

  const buildContext = (req: Record<string, unknown>, res: unknown): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
    }) as unknown as ExecutionContext;

  const request = { url: '/api/courses', query: { page: '1' }, method: 'GET' };

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    // Logger.prototype.log is shared across instances, so spying on the prototype
    // captures the call made by the interceptor's private logger.
    logSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('registers a finish listener and passes the handler result through', async () => {
    const res = buildRawRes();

    const result = await new Promise(resolve =>
      interceptor.intercept(buildContext(request, res), next).subscribe(resolve),
    );

    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
    expect(result).toBe('handler-result');
  });

  it('does not log until the response finishes', () => {
    interceptor.intercept(buildContext(request, buildRawRes()), next).subscribe();

    expect(logSpy).not.toHaveBeenCalled();
  });

  it('logs request metadata when the response finishes', () => {
    const res = buildRawRes(201);
    const req = { url: '/api/x', query: { a: 'b' }, method: 'POST' };

    interceptor.intercept(buildContext(req, res), next).subscribe();
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

  it('reads the raw response from the fastify-style `raw` property when present', () => {
    const raw = buildRawRes(404);
    const reply = { raw };

    interceptor.intercept(buildContext(request, reply), next).subscribe();
    finishListener?.();

    expect(raw.on).toHaveBeenCalledWith('finish', expect.any(Function));
    const payload = logSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.status).toBe(404);
  });

  it('includes the user id when a user is attached to the request', () => {
    interceptor.intercept(buildContext({ ...request, user: { id: 42 } }, buildRawRes()), next).subscribe();
    finishListener?.();

    const payload = logSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.userId).toBe(42);
  });
});
