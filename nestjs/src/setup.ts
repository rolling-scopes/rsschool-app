import { BadRequestException, INestApplication, ValidationError, ValidationPipe } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import cookieParser from 'cookie-parser';
import { json } from 'express';
import { Logger } from 'nestjs-pino';
import { EntityNotFoundFilter, SentryFilter } from './core/filters';
import { ValidationFilter } from './core/validation';
import { HttpAdapterHost } from '@nestjs/core';

export function setupApp(app: INestApplication) {
  const logger = app.get(Logger);
  app.enableCors();
  app.useLogger(logger);
  app.use(cookieParser());
  // Register a global JSON body parser. NestJS skips registering its own default
  // body parsers once any json middleware is applied, so this must be global —
  // a path-scoped json() would leave every other route without a parsed JSON body.
  // 20mb limit matches the legacy koa server (jupyter notebook uploads to /files/upload).
  app.use(json({ limit: '20mb' }));

  if (process.env.SENTRY_DSN) {
    const ignoredExceptions = ['UnauthorizedException', 'TokenExpiredError', 'NotFoundException'];

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      enableTracing: false,
      defaultIntegrations: false,
      debug: false,
      beforeSend(event) {
        const [value] = event.exception?.values ?? [];
        if (value?.type && ignoredExceptions.includes(value.type)) {
          return null;
        }
        return event;
      },
    });
  }

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryFilter(httpAdapterHost.httpAdapter), new EntityNotFoundFilter());
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
