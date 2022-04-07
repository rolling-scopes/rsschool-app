import type { IncomingMessage, ServerResponse } from 'http';

const reqResMapper = require('@apalchys/next-aws-lambda/lib/compatLayer');

// set BINARY_SUPPORT to true to enable binary response support
process.env.BINARY_SUPPORT = 'yes';

// converts API Gateway event to Next.js compatible request/response
export const eventToReqRes = (
  event,
): {
  req: IncomingMessage;
  res: ServerResponse;
  responsePromise: Promise<any>;
} => {
  // responsePromise will be resolved when response completed
  const { req, res, responsePromise } = reqResMapper(event);

  // function emulates internal NodeJs HttpResponse API
  // https://github.com/expressjs/compression/pull/128
  res._implicitHeader = () => res.writeHead(res.statusCode);

  return { req, res, responsePromise };
};
