import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { exit } from 'process';

const generate = async () => {
  const config = new DocumentBuilder().build();
  const app = await NestFactory.create(AppModule, { logger: null });
  app.setGlobalPrefix('api/v2');
  const document = SwaggerModule.createDocument(app, config);

  fs.writeFileSync('./src/spec.json', JSON.stringify(document));
};

generate().then(() => exit(0));
