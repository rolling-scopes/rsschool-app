import { ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { SentryFilter } from './sentry.filter';

vi.mock('@sentry/node', () => ({
  captureException: vi.fn(),
}));

const mockHost = {
  switchToHttp: () => ({
    getResponse: () => ({
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }),
    getRequest: () => ({}),
  }),
} as unknown as ArgumentsHost;

describe('SentryFilter', () => {
  let filter: SentryFilter;
  let superCatchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    filter = new SentryFilter();
    // Stub the base NestJS catch so it doesn't try to build a real HTTP response.
    superCatchSpy = vi.spyOn(BaseExceptionFilter.prototype, 'catch').mockImplementation(() => undefined);
    vi.mocked(Sentry.captureException).mockClear();
  });

  afterEach(() => {
    superCatchSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should be an instance of BaseExceptionFilter', () => {
    expect(filter).toBeInstanceOf(BaseExceptionFilter);
  });

  describe('catch', () => {
    it('should report the exception to Sentry', () => {
      const exception = new Error('boom');

      filter.catch(exception, mockHost);

      expect(Sentry.captureException).toHaveBeenCalledTimes(1);
      expect(Sentry.captureException).toHaveBeenCalledWith(exception);
    });

    it('should delegate to the base exception filter with the same arguments', () => {
      const exception = new Error('boom');

      filter.catch(exception, mockHost);

      expect(superCatchSpy).toHaveBeenCalledTimes(1);
      expect(superCatchSpy).toHaveBeenCalledWith(exception, mockHost);
    });

    it('should capture before delegating to the base filter', () => {
      const exception = new Error('order');
      const callOrder: string[] = [];
      vi.mocked(Sentry.captureException).mockImplementation(() => {
        callOrder.push('sentry');
        return '' as never;
      });
      superCatchSpy.mockImplementation(() => {
        callOrder.push('super');
      });

      filter.catch(exception, mockHost);

      expect(callOrder).toEqual(['sentry', 'super']);
    });

    it('should handle non-Error exception values (unknown)', () => {
      const exception = { weird: 'shape' };

      filter.catch(exception, mockHost);

      expect(Sentry.captureException).toHaveBeenCalledWith(exception);
      expect(superCatchSpy).toHaveBeenCalledWith(exception, mockHost);
    });
  });
});
