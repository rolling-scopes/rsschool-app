import { BadRequestException, INestApplication, ValidationError, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { EntityNotFoundFilter } from './core/filters';
import { ValidationFilter } from './core/validation';

export function setupApp(app: INestApplication) {
  app.enableCors();
  app.useLogger(app.get(Logger));
  app.use(cookieParser());
  app.useGlobalFilters(new ValidationFilter());
  app.useGlobalFilters(new EntityNotFoundFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      skipMissingProperties: false,
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const message = errors.map(error => Object.values(error?.constraints ?? {}).join('\n')).join('\n');
        return new BadRequestException(message);
      },
    }),
  );
}
