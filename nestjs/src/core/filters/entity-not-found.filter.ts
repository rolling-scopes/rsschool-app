import { ArgumentsHost, Catch, ExceptionFilter, NotFoundException } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { EntityNotFoundError } from 'typeorm';

const exception = new NotFoundException();

@Catch(EntityNotFoundError)
export class EntityNotFoundFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(_: EntityNotFoundError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    this.httpAdapterHost.httpAdapter.reply(response, exception.getResponse(), 404);
  }
}
