if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config();
}
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { setupApp } from './setup';

const port = process.env.NODE_PORT || 3002;
const isLambda = !process.env.AWS_LAMBDA;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true, logger: isLambda ? console : undefined });

  setupApp(app);

  const config = new DocumentBuilder().setTitle('RS School API').build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(port);
}

bootstrap();
