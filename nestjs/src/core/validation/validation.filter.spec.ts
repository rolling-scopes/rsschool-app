import { ArgumentsHost, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ValidationFilter } from './validation.filter';
import { ValidationException } from './validation.exception';

const mockResponse = {};

const mockHost = {
  switchToHttp: () => ({
    getResponse: () => mockResponse,
    getRequest: () => ({}),
  }),
} as unknown as ArgumentsHost;

describe('ValidationFilter', () => {
  let filter: ValidationFilter;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  const reply = vi.fn();

  beforeEach(() => {
    filter = new ValidationFilter({ httpAdapter: { reply } } as unknown as HttpAdapterHost);
    warnSpy = vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should reply with a 400 status code and the validation errors in the body', () => {
      const errors = ['name must be a string', 'age must be a number'];
      const exception = new ValidationException(errors);

      filter.catch(exception, mockHost);

      expect(reply).toHaveBeenCalledExactlyOnceWith(mockResponse, { statusCode: 400, errors }, 400);
    });

    it('should handle an empty validation errors array', () => {
      const exception = new ValidationException([]);

      filter.catch(exception, mockHost);

      expect(reply).toHaveBeenCalledExactlyOnceWith(mockResponse, { statusCode: 400, errors: [] }, 400);
    });

    it('should log the validation errors joined by newlines as a warning', () => {
      const errors = ['name must be a string', 'age must be a number'];
      const exception = new ValidationException(errors);

      filter.catch(exception, mockHost);

      expect(warnSpy).toHaveBeenCalledWith('name must be a string\nage must be a number');
    });
  });
});
