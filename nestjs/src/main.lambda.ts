import { APIGatewayEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Callback, Context } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { setupApp } from './setup';
import { AppModule } from './app.module';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const serverlessExpress = require('@vendia/serverless-express');

let cachedServer: (event: APIGatewayEvent, context: Context, callback: Callback) => Promise<APIGatewayProxyResult>;

async function bootstrap() {
  if (!cachedServer) {
    const expressApp = express();
    const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    setupApp(nestApp);
    await nestApp.init();
    cachedServer = serverlessExpress({ app: expressApp });
  }
  return cachedServer;
}

export const handler: APIGatewayProxyHandler = async (event, context, callback) => {
  const server = await bootstrap();
  const result = await server(event, context, callback);

  // it's a dirty fix for dev login redirect
  if (result && result.statusCode === 200 && !result.body && result.multiValueHeaders?.location?.[0] === '/') {
    result.statusCode = 307;
  }
  return result;
};
