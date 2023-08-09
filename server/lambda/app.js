const path = require('path');

// we need to explicitly specify path
// cause in Container Lambda the node process is executed from the /var/task directory based on the file specified in the CMD instruction
const envPath = path.resolve(process.cwd(), './server/.env');
require('dotenv').config({ path: envPath });

const serverlessExpress = require('@vendia/serverless-express');
const server = require('./server/src/app');

const app = new server.App();
let serverlessExpressInstance;

async function setup(event, context) {
  const koa = await app.pgConnect().then(() => app.start(true));

  serverlessExpressInstance = serverlessExpress({ app: koa });
  return serverlessExpressInstance(event, context);
}

exports.handler = (event, context) => {
  if (serverlessExpressInstance) {
    return serverlessExpressInstance(event, context);
  }
  return setup(event, context);
};
