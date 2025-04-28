import * as cdk from 'aws-cdk-lib';
import * as apiv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as alias from 'aws-cdk-lib/aws-route53-targets';

import { CfnOutput } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { Construct } from 'constructs';
import { DockerFunction } from './DockerFunctionConstruct';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

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

    const commonOriginRequestPolicy = new cloudfront.OriginRequestPolicy(this, 'CommonOriginRequestPolicy', {
      queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
      headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList('Origin', 'Authorization'),
      cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(),
    });

    const createBehavior = (originDomain: string) => ({
      origin: new origins.HttpOrigin(originDomain, {
        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
      }),
      allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      originRequestPolicy: commonOriginRequestPolicy,
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

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultRootObject: '/',
      domainNames: [this.fqdn],
      certificate: acm.Certificate.fromCertificateArn(this, 'Certificate', certificateArn),
      defaultBehavior: createBehavior(nextApp.domainName),
      additionalBehaviors: {
        '/api/*': createBehavior(serverApi.domainName),
        '/api/v2/*': createBehavior(nestjsApi.domainName),
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
