import * as cdk from 'aws-cdk-lib';
import { RsSchoolAppStack } from './Stack';

const app = new cdk.App();

const branch = app.node.tryGetContext('branch') ?? 'master';
const deployId = app.node.tryGetContext('deployId') ?? new Date().getTime().toString();

new RsSchoolAppStack(app, `rsschool-app-${branch}`, {
  env: { account: '511361162520', region: 'eu-central-1' },
  branch,
  deployId,
  certificateArn: 'arn:aws:acm:us-east-1:511361162520:certificate/07e01035-1bb4-430c-8b82-625565f66bdb',
});
