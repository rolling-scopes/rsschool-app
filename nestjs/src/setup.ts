import { BadRequestException, INestApplication, ValidationError, ValidationPipe } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import * as cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { EntityNotFoundFilter, SentryFilter } from './core/filters';
import { ValidationFilter } from './core/validation';
import { HttpAdapterHost } from '@nestjs/core';

export function setupApp(app: INestApplication) {
  const logger = app.get(Logger);
  app.enableCors();
  app.useLogger(logger);
  app.use(cookieParser());

  if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN });
  }

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new EntityNotFoundFilter(), new SentryFilter(httpAdapterHost.httpAdapter));
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
