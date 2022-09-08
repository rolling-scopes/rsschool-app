/* eslint-disable no-console */
/*
 Entry file should be in the root and called "app"
*/
import next from 'next';
import slsHttp from 'serverless-http';
import { ServerResponse, IncomingMessage } from 'http';

const app = next({ dev: false });
const nextHandler = app.getRequestHandler();

const getErrMessage = (e: any) => ({ message: 'Server failed to respond.', details: e });

export const handler = slsHttp(
  async (req: IncomingMessage, res: ServerResponse) => {
    console.info('REQUEST', `[${req.url}, ${req.method}]`);

    req.url = `https://pr1723.app.rs.school${req.url?.replace('//', '/')}`;

    console.info('REQUEST', 'Fixed', `[${req.url}]`);
    await nextHandler(req, res).catch(e => {
      console.error('REQUEST', `NextJS request failed due to:`, e);

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(getErrMessage(e), null, 3));
    });
    console.info('REQUEST', `Completed`, `[${res.statusCode}]`);
  },
  {
    // We have separate function for handling images. Assets are handled by S3.
    binary: true,
  },
);
