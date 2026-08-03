import { ArgumentsHost, NotFoundException } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { EntityNotFoundError } from 'typeorm';
import { EntityNotFoundFilter } from './entity-not-found.filter';

const mockResponse = {};

const mockHost = {
  switchToHttp: () => ({
    getResponse: () => mockResponse,
    getRequest: () => ({}),
  }),
} as unknown as ArgumentsHost;

describe('EntityNotFoundFilter', () => {
  let filter: EntityNotFoundFilter;
  const reply = vi.fn();

  beforeEach(() => {
    filter = new EntityNotFoundFilter({ httpAdapter: { reply } } as unknown as HttpAdapterHost);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    const exception = new EntityNotFoundError('SomeEntity', {});

    it('should reply with a 404 status code and the NotFoundException body', () => {
      filter.catch(exception, mockHost);

      expect(reply).toHaveBeenCalledExactlyOnceWith(mockResponse, new NotFoundException().getResponse(), 404);
      expect(reply).toHaveBeenCalledWith(mockResponse, { message: 'Not Found', statusCode: 404 }, 404);
    });
  });
});
