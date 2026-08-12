if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv').config();
}

import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { createAdapter, setupApp } from './setup';
import './core/templates';

const port = process.env.NODE_PORT || 3002;
const isLambda = !!process.env.AWS_LAMBDA;

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, createAdapter(), {
    bufferLogs: true,
    logger: isLambda ? console : undefined,
  });

  await setupApp(app);

  const config = new DocumentBuilder().setTitle('RS School API').build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  // 0.0.0.0 is required: fastify binds localhost by default, which would make
  // the prod container unreachable behind nginx (Lambda would mask the bug —
  // its web adapter connects to localhost).
  await app.listen(port, '0.0.0.0');
}

bootstrap();
