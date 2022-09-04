import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { ValidationException } from './validation.exception';

@Catch(ValidationException)
export class ValidationFilter implements ExceptionFilter {
  private logger = new Logger(ValidationFilter.name);

  catch(exception: ValidationException, host: ArgumentsHost): any {
    const context = host.switchToHttp();
    const response = context.getResponse();
    this.logger.warn(exception.validationErrors.join('\n'));
    return response.status(400).json({
      statusCode: 400,
      errors: exception.validationErrors,
    });
  }
}
