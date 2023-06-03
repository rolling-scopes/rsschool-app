// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { handler } = require('./nestjs/src/main.lambda');

exports.handler = handler;
