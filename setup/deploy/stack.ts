import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as alias from 'aws-cdk-lib/aws-route53-targets';
import * as apiv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { Repository } from 'aws-cdk-lib/aws-ecr';

import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { Construct } from 'constructs';
import { DockerFunction, DockerFunctionProps } from './DockerFunctionConstruct';

type Props = cdk.StackProps & {
  branch: string;
  deployId: string;
  certificateArn: string;
};

export class RsSchoolAppStack extends cdk.Stack {
  fqdn: string;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const { branch, certificateArn, deployId } = props;

    this.fqdn = `env-${branch}.app.rs.school`;

    const httpApi = new apiv2.HttpApi(this, 'HttpApi', {
      apiName: branch,
    });

    const nextApp = new DockerFunction(this, 'nextApp', {
      branch,
      deployId,
      httpApi: httpApi,
      repository: Repository.fromRepositoryName(this, 'UiRepository', 'rsschool-ui'),
    });

    const serverApi = new DockerFunction(this, 'ServerApi', {
      branch,
      deployId,
      httpApi: httpApi,
      memorySize: 2048,
      basePath: '/api/{proxy+}',
      variables: {
        NODE_ENV: 'development',
      },
      repository: Repository.fromRepositoryName(this, 'ServerRepository', 'rsschool-server'),
    });

    const nestjsApi = new DockerFunction(this, 'NestjsApi', {
      branch,
      deployId,
      httpApi: httpApi,
      memorySize: 2048,
      basePath: '/api/v2/{proxy+}',
      variables: {
        NODE_ENV: 'development',
      },
      repository: Repository.fromRepositoryName(this, 'NestjsRepository', 'rsschool-nestjs'),
    });

    const noCacheBehavior: cloudfront.Behavior = {
      allowedMethods: cloudfront.CloudFrontAllowedMethods.ALL,
      defaultTtl: cdk.Duration.seconds(0),
      minTtl: cdk.Duration.seconds(0),
      maxTtl: cdk.Duration.seconds(0),
      forwardedValues: {
        queryString: true,
        headers: ['Origin', 'Authorization'],
        cookies: {
          forward: 'all',
        },
      },
    };

    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'Distribution', {
      originConfigs: [
        {
          customOriginSource: {
            domainName: nestjsApi.domainName,
            originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
          },
          behaviors: [{ pathPattern: '/api/v2/*', ...noCacheBehavior }],
        },
        {
          customOriginSource: {
            domainName: serverApi.domainName,
            originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
          },
          behaviors: [{ pathPattern: '/api/*', ...noCacheBehavior }],
        },
        {
          customOriginSource: {
            domainName: nextApp.domainName,
            originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
          },
          behaviors: [{ isDefaultBehavior: true, ...noCacheBehavior }],
        },
      ],
      defaultRootObject: '/',
      viewerCertificate: {
        aliases: [this.fqdn],
        props: {
          // cloudfront needs certificate in us-east-1 so we pass it as string
          acmCertificateArn: certificateArn,
          sslSupportMethod: 'sni-only',
          minimumProtocolVersion: 'TLSv1.2_2019',
        },
      },
    });

    // Create a DNS record. in Production it will be an apex record, otherwise we set recordName
    new route53.ARecord(this, 'AliasRecord', {
      target: route53.RecordTarget.fromAlias(new alias.CloudFrontTarget(distribution)),
      zone: route53.HostedZone.fromLookup(this, 'HostedZone', {
        domainName: 'rs.school',
      }),
      recordName: this.fqdn,
    });
  }
}
