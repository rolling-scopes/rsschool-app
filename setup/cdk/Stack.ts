import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as alias from 'aws-cdk-lib/aws-route53-targets';
import * as apiv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { Repository } from 'aws-cdk-lib/aws-ecr';

import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { Construct } from 'constructs';
import { DockerFunction } from './DockerFunctionConstruct';
import { CfnOutput } from 'aws-cdk-lib';

type Props = cdk.StackProps & {
  feature: string;
  deployId: string;
  certificateArn: string;
};

export class RsSchoolAppStack extends cdk.Stack {
  fqdn: string;
  url: string;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const { feature, certificateArn, deployId } = props;

    this.fqdn = `${feature}.app.rs.school`;
    this.url = `https://${this.fqdn}`;

    const httpApi = new apiv2.HttpApi(this, 'HttpApi', {
      apiName: feature,
    });

    const defaultProps = { feature, deployId, httpApi, memorySize: 4096 };

    const nextApp = new DockerFunction(this, 'Next', {
      ...defaultProps,
      repository: Repository.fromRepositoryName(this, 'UiRepository', 'rsschool-ui'),
      variables: {
        NODE_ENV: 'production',
        RS_HOST: this.url,
      },
    });

    const serverApi = new DockerFunction(this, 'ServerApi', {
      ...defaultProps,
      basePath: '/api/{proxy+}',
      variables: {
        NODE_ENV: 'development',
      },
      repository: Repository.fromRepositoryName(this, 'ServerRepository', 'rsschool-server'),
    });

    const nestjsApi = new DockerFunction(this, 'NestjsApi', {
      ...defaultProps,
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

    new CfnOutput(this, 'Url', { value: this.url });
  }
}
