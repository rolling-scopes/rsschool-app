import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { createAdapter } from './setup';
import * as fs from 'fs';
import { exit } from 'process';

const generate = async () => {
  const config = new DocumentBuilder().addServer('/api/v2').build();
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, createAdapter(), { logger: ['error'] });
  // Route-registration canary: find-my-way validates the whole route tree at
  // init, so an incompatible route fails the spec generation instead of prod.
  await app.init();
  const document = SwaggerModule.createDocument(app, config);

  fs.writeFileSync('./src/spec.json', JSON.stringify(document));
};

generate().then(() => exit(0));
