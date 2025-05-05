import * as cdk from 'aws-cdk-lib';
import * as apiv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as alias from 'aws-cdk-lib/aws-route53-targets';

import { CfnOutput } from 'aws-cdk-lib';
import {
  Distribution,
  OriginRequestPolicy,
  OriginRequestQueryStringBehavior,
  OriginRequestHeaderBehavior,
  OriginRequestCookieBehavior,
  OriginProtocolPolicy,
  AllowedMethods,
  CachePolicy,
  CacheHeaderBehavior,
  CacheQueryStringBehavior,
  CacheCookieBehavior,
} from 'aws-cdk-lib/aws-cloudfront';
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

    const authorizationCachePolicy = new CachePolicy(this, 'AuthorizationCachePolicy', {
      defaultTtl: cdk.Duration.seconds(5),
      minTtl: cdk.Duration.seconds(0),
      maxTtl: cdk.Duration.seconds(60),
      headerBehavior: CacheHeaderBehavior.allowList('Authorization'),
      queryStringBehavior: CacheQueryStringBehavior.all(),
      cookieBehavior: CacheCookieBehavior.all(),
    });

    const commonOriginRequestPolicy = new OriginRequestPolicy(this, 'CommonOriginRequestPolicy', {
      queryStringBehavior: OriginRequestQueryStringBehavior.all(),
      headerBehavior: OriginRequestHeaderBehavior.allowList('Origin'),
      cookieBehavior: OriginRequestCookieBehavior.all(),
    });

    const createBehavior = (originDomain: string) => ({
      origin: new origins.HttpOrigin(originDomain, {
        protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
      }),
      allowedMethods: AllowedMethods.ALLOW_ALL,
      cachePolicy: authorizationCachePolicy,
      originRequestPolicy: commonOriginRequestPolicy,
    });

    const distribution = new Distribution(this, 'Distribution', {
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
