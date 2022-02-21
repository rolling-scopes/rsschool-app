import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as custom from 'aws-cdk-lib/custom-resources';
import * as iam from 'aws-cdk-lib/aws-iam';
import { IRepository } from 'aws-cdk-lib/aws-ecr';
import * as apiv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

export type DockerFunctionProps = cdk.StackProps & {
  feature: string;
  deployId: string;
  variables?: Record<string, string>;
  repository: IRepository;
  httpApi: apiv2.HttpApi;
  basePath?: string;
  memorySize?: number;
};

export class DockerFunction extends Construct {
  public domainName: string;

  private readonly defaultBasePath = '/{proxy+}';

  constructor(scope: Construct, id: string, props: DockerFunctionProps) {
    super(scope, id);
    const { feature, variables, httpApi, basePath, deployId, memorySize } = props;

    const tag = feature;
    const dockerImageFunction = new lambda.DockerImageFunction(this, 'DockerImageFunction', {
      description: tag,
      code: lambda.DockerImageCode.fromEcr(props.repository, { tag }),
      memorySize: memorySize ?? 1024,
      timeout: cdk.Duration.seconds(30),
      environment: variables,
    });
    new logs.LogRetention(this, 'LogRetention', {
      logGroupName: dockerImageFunction.logGroup.logGroupName,
      retention: logs.RetentionDays.TWO_WEEKS,
    });
    const integration = new HttpLambdaIntegration('LambdaIntegration', dockerImageFunction, {
      payloadFormatVersion: apiv2.PayloadFormatVersion.VERSION_1_0,
    });
    httpApi.addRoutes({ path: basePath ?? this.defaultBasePath, integration });
    const [domainName] = httpApi.url?.replace('https://', '').split('/') ?? [];
    this.domainName = domainName ?? '';

    const dockerImageUpdater = new custom.AwsCustomResource(this, 'DockerImageUpdater', {
      installLatestAwsSdk: false,
      onCreate: {
        physicalResourceId: custom.PhysicalResourceId.of(feature),
        service: 'Lambda',
        action: 'updateFunctionCode',
        parameters: {
          FunctionName: dockerImageFunction.functionName,
          ImageUri: props.repository.repositoryUriForTag(tag),
        },
      },
      onUpdate: {
        service: 'Lambda',
        action: 'updateFunctionCode',
        parameters: {
          FunctionName: dockerImageFunction.functionName,
          ImageUri: props.repository.repositoryUriForTag(tag),
        },
        physicalResourceId: custom.PhysicalResourceId.of(deployId),
      },
      policy: custom.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ['lambda:UpdateFunctionCode'],
          effect: iam.Effect.ALLOW,
          resources: ['*'],
        }),
      ]),
    });
    dockerImageUpdater.node.addDependency(dockerImageFunction);
  }
}
