import * as Router from 'koa-router';
import * as AWS from 'aws-sdk';
import { ILogger } from '../../logger';
import { guard, adminGuard } from '../guards';
import { createPostRoute } from '../common';
import { getRepository } from 'typeorm';
import { Certificate } from '../../models';
import { config } from '../../config';

AWS.config.update({
  region: 'eu-central-1',
  secretAccessKey: config.aws.secretAccessKey,
  accessKeyId: config.aws.accessKeyId,
});
const s3 = new AWS.S3();

export function certificateRoute(logger: ILogger) {
  const router = new Router({ prefix: '/certificate' });

  router.get('/:id', guard, async (ctx: Router.RouterContext) => {
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

  router.post('/', adminGuard, createPostRoute(Certificate, logger));

  return router;
}
