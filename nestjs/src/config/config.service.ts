import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

type AuthConfig = {
  github: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
    scope: string[];
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

@Injectable()
export class ConfigService {
  public readonly auth: AuthConfig;
  public readonly users: UsersConfig;

  constructor(conf: NestConfigService) {
    this.auth = {
      github: {
        clientId: conf.get('RSSHCOOL_AUTH_GITHUB_CLIENT_ID'),
        clientSecret: conf.get('RSSHCOOL_AUTH_GITHUB_CLIENT_SECRET'),
        callbackUrl: conf.get('RSSHCOOL_AUTH_GITHUB_CALLBACK'),
        scope: ['user:email'],
      },
      dev: {
        username: conf.get('RSSCHOOL_AUTH_DEV_USERNAME'),
        admin: conf.get<string>('RSSCHOOL_AUTH_DEV_ADMIN')?.toLowerCase() === 'true',
      },
      jwt: {
        secretKey: conf.get('RSSHCOOL_JWT_SECRET_KEY') ?? 'secret',
      },
    };

    this.users = {
      root: {
        username: conf.get('RSSHCOOL_USERS_ADMIN_USERNAME'),
        password: conf.get('RSSHCOOL_USERS_ADMIN_PASSWORD'),
      },
      hirers: conf.get('RSSHCOOL_USERS_HIRERS')?.split(',') ?? [],
      admins: [],
    };
  }
}
