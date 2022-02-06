import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { IRepository } from 'aws-cdk-lib/aws-ecr';
import * as apiv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

export type DockerFunctionProps = cdk.StackProps & {
  branch: string;
  variables?: Record<string, string>;
  repository: IRepository;
  httpApi: apiv2.HttpApi;
  basePath?: string;
};

export class DockerFunction extends Construct {
  public domainName: string;

  private readonly defaultBasePath = '/{proxy+}';

  constructor(scope: Construct, id: string, props: DockerFunctionProps) {
    super(scope, id);
    const { branch, variables, httpApi, basePath } = props;
    const dockerImageFunction = new lambda.DockerImageFunction(this, 'DockerImageFunction', {
      description: branch,
      code: lambda.DockerImageCode.fromEcr(props.repository, { tag: branch }),
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      environment: variables,
    });
    const integration = new HttpLambdaIntegration('LambdaIntegration', dockerImageFunction, {
      payloadFormatVersion: apiv2.PayloadFormatVersion.VERSION_1_0,
    });
    httpApi.addRoutes({ path: basePath ?? this.defaultBasePath, integration });
    const [domainName] = httpApi.url?.replace('https://', '').split('/') ?? [];
    this.domainName = domainName ?? '';
  }
}
