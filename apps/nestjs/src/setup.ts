import { BadRequestException, INestApplication, ValidationError, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { CloudApiService } from './cloud-api/cloud-api.service';
import { ConfigService } from './config';
import { EntityNotFoundFilter, UnhandledExceptionsFilter } from './core/filters';
import { ValidationFilter } from './core/validation';

export function setupApp(app: INestApplication) {
  const logger = app.get(Logger);
  app.enableCors();
  app.useLogger(logger);
  app.use(cookieParser());

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new UnhandledExceptionsFilter(httpAdapterHost, app.get(CloudApiService), app.get(ConfigService)),
    new EntityNotFoundFilter(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      skipMissingProperties: false,
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const message = errors.map(error => Object.values(error?.constraints ?? {}).join('\n')).join('\n');
        logger.warn('Validation Pipe Error', errors);
        return new BadRequestException(message);
      },
    }),
  );
  app.useGlobalFilters(new ValidationFilter());
}
