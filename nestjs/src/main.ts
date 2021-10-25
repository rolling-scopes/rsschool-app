if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { utilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app.module';

const port = process.env.NODE_PORT || 3002;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            utilities.format.nestLike('App', { prettyPrint: true }),
          ),
        }),
      ],
    }),
  });
  app.use(cookieParser());
  await app.listen(port);
}
bootstrap();
