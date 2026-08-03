import { CallHandler, ExecutionContext } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { of } from 'rxjs';
import { NoCacheInterceptor } from './no-cache.interceptor';

describe('NoCacheInterceptor', () => {
  const setHeader = vi.fn();
  const response = {};
  const next: CallHandler = { handle: () => of('handler-result') };

  const buildContext = (method: string): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ method }),
        getResponse: () => response,
      }),
    }) as unknown as ExecutionContext;

  const buildInterceptor = () => new NoCacheInterceptor({ httpAdapter: { setHeader } } as unknown as HttpAdapterHost);

  it('should be defined', () => {
    expect(buildInterceptor()).toBeDefined();
  });

  it('sets Cache-Control: no-cache on GET requests', () => {
    buildInterceptor().intercept(buildContext('GET'), next).subscribe();

    expect(setHeader).toHaveBeenCalledExactlyOnceWith(response, 'Cache-Control', 'no-cache');
  });

  it('does not touch non-GET requests', () => {
    buildInterceptor().intercept(buildContext('POST'), next).subscribe();

    expect(setHeader).not.toHaveBeenCalled();
  });

  it('passes the handler result through', async () => {
    const result = await new Promise(resolve =>
      buildInterceptor().intercept(buildContext('GET'), next).subscribe(resolve),
    );

    expect(result).toBe('handler-result');
  });
});
