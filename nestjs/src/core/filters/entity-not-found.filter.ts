import { ArgumentsHost, Catch, ExceptionFilter, NotFoundException } from '@nestjs/common';
import { EntityNotFoundError } from 'typeorm';

const exception = new NotFoundException();

@Catch(EntityNotFoundError)
export class EntityNotFoundFilter implements ExceptionFilter {
  catch(error: EntityNotFoundError, host: ArgumentsHost): any {
    const context = host.switchToHttp();
    const response = context.getResponse();
    return response.status(404).json(exception.getResponse());
  }
}
