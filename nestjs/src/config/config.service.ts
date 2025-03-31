import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { AwsCredentialIdentity } from '@smithy/types';

type AuthConfig = {
  github: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
    scope: string[];
    activityWebhookSecret: string;
    integrationSiteToken: string;
  };
  dev: {
    username: string;
    admin: boolean;
  };
  jwt: {
    secretKey: string;
  };
};

type UsersConfig = {
  root: {
    username: string;
    password: string;
  };
  admins: string[];
  hirers: string[];
};

type AWSServices = {
  restApiUrl: string;
  restApiKey: string;
};

type AwsClient = {
  credentials: AwsCredentialIdentity;
  region: string;
};

type Secure = {
  encryptKey: string;
};

@Injectable()
export class ConfigService {
  public readonly auth: AuthConfig;
  public readonly users: UsersConfig;
  public readonly awsServices: AWSServices;
  public readonly awsClient: AwsClient;
  public readonly host: string;
  public readonly isDev = process.env.NODE_ENV !== 'production';
  public readonly secure: Secure;
  public readonly openai: { apiKey: string };
  public readonly env: 'prod' | 'staging' | 'local';

  public readonly buckets: {
    cdn: string;
  };

  constructor(conf: NestConfigService) {
    this.auth = {
      github: {
        clientId: conf.get('RSSHCOOL_AUTH_GITHUB_CLIENT_ID') ?? '',
        clientSecret: conf.get('RSSHCOOL_AUTH_GITHUB_CLIENT_SECRET') ?? '',
        callbackUrl: conf.get('RSSHCOOL_AUTH_GITHUB_CALLBACK') ?? '',
        scope: ['user:email'],
        activityWebhookSecret: conf.get('RSSHCOOL_AUTH_GITHUB_WEBHOOK_ACTIVITY_SECRET', 'activity-webhook'),
        // token for rolling-scopes/site integration
        integrationSiteToken: conf.get('RSSHCOOL_AUTH_GITHUB_INTEGRATION_SITE_TOKEN', ''),
      },
      dev: {
        username: conf.get('RSSCHOOL_AUTH_DEV_USERNAME') ?? '',
        admin: conf.get<string>('RSSCHOOL_AUTH_DEV_ADMIN')?.toLowerCase() === 'true',
      },
      jwt: {
        secretKey: conf.get('RSSHCOOL_AUTH_JWT_SECRET_KEY') ?? 'secret',
      },
    };

    this.openai = {
      apiKey: conf.get('RSSHCOOL_OPENAI_API_KEY') || '',
    };

    this.awsClient = {
      region: conf.get('RSSHCOOL_AWS_REGION') ?? 'eu-central-1',
      credentials: {
        accessKeyId: conf.get('RSSHCOOL_AWS_ACCESS_KEY_ID') ?? '',
        secretAccessKey: conf.get('RSSHCOOL_AWS_SECRET_ACCESS_KEY') || '',
      },
    };

    this.awsServices = {
      restApiUrl: conf.get('RSSHCOOL_AWS_REST_API_URL') || '',
      restApiKey: conf.get('RSSHCOOL_AWS_REST_API_KEY') || '',
    };

    this.users = {
      root: {
        username: conf.get('RSSHCOOL_USERS_CLOUD_USERNAME') ?? '',
        password: conf.get('RSSHCOOL_USERS_CLOUD_PASSWORD') ?? '',
      },
      hirers: conf.get('RSSHCOOL_USERS_HIRERS')?.split(',') ?? [],
      admins: conf.get('RSSHCOOL_USERS_ADMINS')?.split(',') ?? [],
    };

    this.secure = {
      encryptKey: conf.get('RSSHCOOL_SECURE_ENCRYPT_KEY') ?? 'secret',
    };

    this.host = conf.get('RSSHCOOL_HOST') ?? '';

    this.buckets = { cdn: 'cdn.rs.school' };

    this.env = conf.get('RS_ENV') === 'staging' ? 'staging' : this.isDev ? 'local' : 'prod';
  }
}
