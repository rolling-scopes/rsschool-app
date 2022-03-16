/*
 Entry file should be in the root and called "app"
*/
import next from 'next';
import type { APIGatewayProxyEvent } from 'aws-lambda';
import { eventToReqRes } from './eventToReqRes';

const app = next({ dev: false });
const nextHandler = app.getRequestHandler();

export const handler = async (event: APIGatewayProxyEvent): Promise<any> => {
  // eslint-disable-next-line no-console
  console.info('event', event);

  const { req, res, responsePromise } = eventToReqRes(event);

  // eslint-disable-next-line no-console
  console.info('url', req.url);

  // run request processing
  await nextHandler(req, res);

  return await responsePromise;
};
