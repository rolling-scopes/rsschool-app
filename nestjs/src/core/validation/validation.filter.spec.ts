import { ArgumentsHost, Logger } from '@nestjs/common';
import { ValidationFilter } from './validation.filter';
import { ValidationException } from './validation.exception';

const mockResponse = {
  status: vi.fn().mockReturnThis(),
  json: vi.fn(),
};

const mockHost = {
  switchToHttp: () => ({
    getResponse: () => mockResponse,
    getRequest: () => ({}),
  }),
} as unknown as ArgumentsHost;

describe('ValidationFilter', () => {
  let filter: ValidationFilter;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    filter = new ValidationFilter();
    mockResponse.status.mockClear().mockReturnThis();
    mockResponse.json.mockClear();
    warnSpy = vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should respond with a 400 status code', () => {
      const exception = new ValidationException(['name must be a string']);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should respond with the validation errors in the JSON body', () => {
      const errors = ['name must be a string', 'age must be a number'];
      const exception = new ValidationException(errors);

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 400,
        errors,
      });
    });

    it('should handle an empty validation errors array', () => {
      const exception = new ValidationException([]);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 400,
        errors: [],
      });
    });

    it('should log the validation errors joined by newlines as a warning', () => {
      const errors = ['name must be a string', 'age must be a number'];
      const exception = new ValidationException(errors);

      filter.catch(exception, mockHost);

      expect(warnSpy).toHaveBeenCalledWith('name must be a string\nage must be a number');
    });

    it('should chain status().json() on the same response object', () => {
      const exception = new ValidationException(['boom']);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
    });
  });
});
