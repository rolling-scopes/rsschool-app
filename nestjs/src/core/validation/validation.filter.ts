import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ValidationException } from './validation.exception';

@Catch(ValidationException)
export class ValidationFilter implements ExceptionFilter {
  private logger = new Logger(ValidationFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: ValidationException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    this.logger.warn(exception.validationErrors.join('\n'));
    this.httpAdapterHost.httpAdapter.reply(
      response,
      {
        statusCode: 400,
        errors: exception.validationErrors,
      },
      400,
    );
  }
}
