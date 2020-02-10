import Router from 'koa-router';
import * as AWS from 'aws-sdk';
import { OK, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { ILogger } from '../../logger';
import { adminGuard } from '../guards';
import { getRepository } from 'typeorm';
import { Certificate } from '../../models';
import { config } from '../../config';
import { setResponse } from '../utils';

AWS.config.update({
  region: 'eu-central-1',
  secretAccessKey: config.aws.secretAccessKey,
  accessKeyId: config.aws.accessKeyId,
});
const s3 = new AWS.S3();

export function certificateRoute(logger: ILogger) {
  const router = new Router({ prefix: '/certificate' });

  router.get('/:id', async (ctx: Router.RouterContext) => {
    try {
      const certificate = await getRepository(Certificate).findOne({ where: { publicId: ctx.params.id } });
      if (certificate == null) {
        ctx.status = 404;
        return;
      }
      const stream = await s3.getObject({ Bucket: certificate.s3Bucket, Key: certificate.s3Key }).promise();
      ctx.response.set('Content-Type', 'application/pdf');
      ctx.status = 200;
      ctx.body = stream.Body;
    } catch (e) {
      ctx.body = {};
      ctx.status = 404;
    }
  });

  router.post('/', adminGuard, async (ctx: Router.RouterContext) => {
    const data = ctx.request.body;
    try {
      const existing = await getRepository(Certificate).findOne({ where: { studentId: data.studentId } });
      const result =
        existing == null
          ? await getRepository(Certificate).save(data)
          : await getRepository(Certificate).update(existing.id, data);
      setResponse(ctx, OK, result);
    } catch (e) {
      if (logger) {
        logger.error(e.message);
      }
      setResponse(ctx, INTERNAL_SERVER_ERROR, { message: e.message });
    }
  });

  return router;
}
