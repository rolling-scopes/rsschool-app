import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

type AuthConfig = {
  github: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
    scope: string[];
    activityWebhookSecret: string;
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
  region: string;
  secretAccessKey: string;
  accessKeyId: string;
};

type CrossCheckSchedulingConfig = {
  host: string;
};

@Injectable()
export class ConfigService {
  public readonly auth: AuthConfig;
  public readonly users: UsersConfig;
  public readonly awsServices: AWSServices;
  public readonly crossCheckScheduling: CrossCheckSchedulingConfig;
  public isDev = process.env.NODE_ENV !== 'production';

  constructor(conf: NestConfigService) {
    this.auth = {
      github: {
        clientId: conf.get('RSSHCOOL_AUTH_GITHUB_CLIENT_ID') ?? '',
        clientSecret: conf.get('RSSHCOOL_AUTH_GITHUB_CLIENT_SECRET') ?? '',
        callbackUrl: conf.get('RSSHCOOL_AUTH_GITHUB_CALLBACK') ?? '',
        scope: ['user:email'],
        activityWebhookSecret: conf.get('process.env.RSSHCOOL_AUTH_GITHUB_WEBHOOK_ACTIVITY_SECRET', 'activity-webhook'),
      },
      dev: {
        username: conf.get('RSSCHOOL_AUTH_DEV_USERNAME') ?? '',
        admin: conf.get<string>('RSSCHOOL_AUTH_DEV_ADMIN')?.toLowerCase() === 'true',
      },
      jwt: {
        secretKey: conf.get('RSSHCOOL_AUTH_JWT_SECRET_KEY') ?? 'secret',
      },
    };

    this.awsServices = {
      restApiUrl: process.env.RSSHCOOL_AWS_REST_API_URL || '',
      restApiKey: process.env.RSSHCOOL_AWS_REST_API_KEY || '',
      region: process.env.RSSHCOOL_AWS_REGION || '',
      secretAccessKey: process.env.RSSHCOOL_AWS_SECRET_ACCESS_KEY || '',
      accessKeyId: process.env.RSSHCOOL_AWS_ACCESS_KEY_ID || '',
    };

    this.users = {
      root: {
        username: conf.get('RSSHCOOL_USERS_CLOUD_USERNAME') ?? '',
        password: conf.get('RSSHCOOL_USERS_CLOUD_PASSWORD') ?? '',
      },
      hirers: conf.get('RSSHCOOL_USERS_HIRERS')?.split(',') ?? [],
      admins: conf.get('RSSHCOOL_USERS_ADMINS')?.split(',') ?? [],
    };

    const DEV_HOST = conf.get('RSSCHOOL_CROSS_CHECK_SCHEDULING_DEV_HOST') ?? '';
    const PROD_HOST = conf.get('RSSCHOOL_CROSS_CHECK_SCHEDULING_PROD_HOST') ?? '';

    this.crossCheckScheduling = {
      host: this.isDev ? DEV_HOST : PROD_HOST,
    };
  }
}
