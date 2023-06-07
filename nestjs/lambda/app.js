// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
const envPath = path.resolve(process.cwd(), './nestjs/.env');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: envPath });
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { handler } = require('./nestjs/src/main.lambda');

exports.handler = handler;
