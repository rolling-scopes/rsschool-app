import { NextFunction, Request, Response } from 'express';
import { NoCacheMiddleware } from './no-cache.middleware';

describe('NoCacheMiddleware', () => {
  let middleware: NoCacheMiddleware;
  let setHeader: ReturnType<typeof vi.fn>;
  let next: NextFunction;
  let res: Response;

  beforeEach(() => {
    middleware = new NoCacheMiddleware();
    setHeader = vi.fn();
    next = vi.fn();
    res = { setHeader } as Partial<Response> as Response;
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('sets the Cache-Control header to no-cache', () => {
    middleware.use({} as Request, res, next);

    expect(setHeader).toHaveBeenCalledTimes(1);
    expect(setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
  });

  it('calls next()', () => {
    middleware.use({} as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('sets the header before calling next', () => {
    const order: string[] = [];
    setHeader.mockImplementation(() => order.push('setHeader'));
    (next as ReturnType<typeof vi.fn>).mockImplementation(() => order.push('next'));

    middleware.use({} as Request, res, next);

    expect(order).toEqual(['setHeader', 'next']);
  });
});
