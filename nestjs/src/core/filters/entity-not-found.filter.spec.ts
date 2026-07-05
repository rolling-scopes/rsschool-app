import { ArgumentsHost, NotFoundException } from '@nestjs/common';
import { EntityNotFoundError } from 'typeorm';
import { EntityNotFoundFilter } from './entity-not-found.filter';

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

describe('EntityNotFoundFilter', () => {
  let filter: EntityNotFoundFilter;

  beforeEach(() => {
    filter = new EntityNotFoundFilter();
    mockResponse.status.mockClear().mockReturnThis();
    mockResponse.json.mockClear();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    const exception = new EntityNotFoundError('SomeEntity', {});

    it('should respond with a 404 status code', () => {
      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should respond with the NotFoundException body as JSON', () => {
      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(new NotFoundException().getResponse());
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Not Found',
        statusCode: 404,
      });
    });

    it('should chain status().json() on the same response object', () => {
      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
    });
  });
});
