import { BadRequestException, INestApplication, ValidationError, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as Sentry from '@sentry/node';
import fastifyCookie from '@fastify/cookie';
import { Logger } from 'nestjs-pino';
import { EntityNotFoundFilter, SentryFilter } from './core/filters';
import { LoggingInterceptor, NoCacheInterceptor } from './core/interceptors';
import { ValidationFilter } from './core/validation';
import { ConfigService } from './config';

type ValidationLogger = Pick<Logger, 'warn'>;

/**
 * The single source of truth for the fastify configuration — shared by the
 * production bootstrap (main.ts), the openapi spec generator and the HTTP
 * smoke suite, so all of them run the exact same adapter.
 */
export function createAdapter() {
  return new FastifyAdapter({
    // 20mb matches the legacy limit (jupyter notebook uploads to /files/upload).
    bodyLimit: 20 * 1024 * 1024,
    // Express was trailing-slash tolerant and case-insensitive; keep url
    // matching behavior identical after the swap (#1123).
    ignoreTrailingSlash: true,
    caseSensitive: false,
    // Client ip/protocol come through nginx (prod) or the Lambda web adapter
    // (staging), so trust the x-forwarded-* headers like Express did.
    trustProxy: true,
  });
}

/**
 * Adapter-agnostic HTTP behavior: CORS, global interceptors/filters and the
 * global validation pipe. Shared between the production bootstrap (setupApp)
 * and the HTTP smoke suite (test/http) so both always exercise identical
 * wiring.
 */
export function configureHttp(app: INestApplication, options: { host?: string; logger?: ValidationLogger } = {}) {
  const { host, logger } = options;
  // Scope CORS to the app origin and allow credentials. The registry endpoint is
  // called cross-origin (app.rs.school -> cdn.rs.school) with the auth-token cookie,
  // so a wildcard `Access-Control-Allow-Origin: *` (the bare enableCors() default) is
  // rejected by the browser. Mirrors the legacy koa config: origin = RSSHCOOL_HOST.
  app.enableCors({
    origin: host || 'http://localhost:3000',
    credentials: true,
  });

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalInterceptors(new LoggingInterceptor(), new NoCacheInterceptor(httpAdapterHost));
  app.useGlobalFilters(new SentryFilter(httpAdapterHost.httpAdapter), new EntityNotFoundFilter(httpAdapterHost));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      skipMissingProperties: false,
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const message = errors.map(error => Object.values(error?.constraints ?? {}).join('\n')).join('\n');
        logger?.warn('Validation Pipe Error', errors);
        return new BadRequestException(message);
      },
    }),
  );
  app.useGlobalFilters(new ValidationFilter(httpAdapterHost));
}

export async function setupApp(app: NestFastifyApplication) {
  const logger = app.get(Logger);
  const config = app.get(ConfigService);
  app.useLogger(logger);
  // Populates request.cookies (the jwt strategy reads the auth-token cookie);
  // replaces the express cookie-parser middleware.
  await app.register(fastifyCookie);

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

  configureHttp(app, { host: config.host, logger });
}
