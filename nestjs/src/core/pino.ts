import { Params } from 'nestjs-pino';
import cloudwatchStream from '@apalchys/pino-cloudwatch';

const devMode = process.env.NODE_ENV !== 'production' && !process.env.AWS_LAMBDA;

const awsAccessKeyId = process.env.RSSHCOOL_AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.RSSHCOOL_AWS_SECRET_ACCESS_KEY;
const awsRegion = process.env.RSSHCOOL_AWS_REGION;

export function getPinoHttp(): Params['pinoHttp'] {
  const pinoOptions = {
    base: {},
    autoLogging: false,
    quietReqLogger: true,
    prettyPrint: devMode ? { ignore: 'time,remoteAddress,req,reqId' } : false,
  };

  if (!devMode && awsAccessKeyId && awsSecretAccessKey) {
    return [
      pinoOptions,
      cloudwatchStream({
        interval: 2000,
        aws_access_key_id: awsAccessKeyId,
        aws_secret_access_key: awsSecretAccessKey,
        aws_region: awsRegion,
        group: '/app/rsschool-api',
        stream: `${new Date().toISOString().split('T')[0]}-nestjs`,
      }),
    ];
  }

  return pinoOptions;
}
