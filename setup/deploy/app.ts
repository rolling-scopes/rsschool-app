import * as cdk from 'aws-cdk-lib';
import { RsSchoolAppStack } from './stack';
import * as crypto from 'crypto';

const app = new cdk.App();

const branch = crypto
  .createHash('md5')
  .update(app.node.tryGetContext('branch') ?? 'master')
  .digest('hex')
  .substr(0, 8);

new RsSchoolAppStack(app, `rsschool-app-${branch}`, {
  env: { account: '511361162520', region: 'eu-central-1' },
  branch,
  certificateArn: 'arn:aws:acm:us-east-1:511361162520:certificate/07e01035-1bb4-430c-8b82-625565f66bdb',
});
