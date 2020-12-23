export interface IConfig {
  app: {
    admins: string[];
  };
  users: {
    verification: {
      username: string;
      password: string;
    };
  };
  auth: {
    callback: string;
    github_client_id: string;
    github_client_secret: string;
    successRedirect: string;
    activityWebhookSecret: string;
    consentSecret: string;
  };
  aws: {
    secretAccessKey: string;
    accessKeyId: string;
    region: string;
    restApiUrl: string;
    restApiKey: string;
  };
  dev: {
    username: string;
    adminEnabled: boolean;
  };
  admin: {
    username: string;
    password: string;
  };
  rateLimit: {
    intervalMin: number;
    max: number;
  };
  roles: {
    adminTeams: string[];
    hirers: string[];
  };
  isDevMode: boolean;
  pg: {
    host: string;
    username: string;
    password: string;
    database: string;
  };
  github: {
    org: string;
    privateKey: string;
    appId: string;
    installationId: string;
    hooksSecret: string;
  };
  port: number;
  name: string;
  sessionAge: number;
  sessionKey: string;
  integrations: {
    heroes: {
      url?: string;
      username: string;
      password: string;
    };
  };
}

export const config: IConfig = {
  app: {
    admins: ['apalchys', 'dzmitry-varabei', 'mikhama', 'davojta', 'shastel', 'sonejka', 'forkollaider'],
  },
  users: {
    verification: {
      username: process.env.RSSHCOOL_API_VERIFICATION_USERNAME || 'test',
      password: process.env.RSSHCOOL_API_VERIFICATION_PASSWORD || 'test',
    },
  },
  auth: {
    callback: process.env.RSSHCOOL_API_AUTH_CALLBACK || 'http://localhost:3001/auth/github/callback',
    github_client_id: process.env.RSSHCOOL_API_AUTH_CLIENT_ID || 'client-id',
    github_client_secret: process.env.RSSHCOOL_API_AUTH_CLIENT_SECRET || 'client-secret',
    successRedirect: process.env.RSSHCOOL_API_AUTH_SUCCESS_REDIRECT || 'http://localhost:3000',
    activityWebhookSecret: process.env.ACTIVITY_WEBHOOK_SECRET || 'activity-webhook',
    consentSecret: process.env.CONSENT_SECRET || 'consent-secret',
  },
  dev: {
    username: process.env.RSSHCOOL_DEV_USERNAME || '',
    adminEnabled: !!(process.env.RSSHCOOL_DEV_ADMIN === 'true' || ''),
  },
  admin: {
    username: process.env.RSSHCOOL_API_ADMIN_USERNAME || '',
    password: process.env.RSSHCOOL_API_ADMIN_PASSWORD || '',
  },
  github: {
    org: 'rolling-scopes-school',
    privateKey: process.env.RSSHCOOL_API_GITHUB_PRIVATE_KEY || '',
    appId: process.env.RSSHCOOL_API_GITHUB_APP_ID || '',
    installationId: process.env.RSSHCOOL_API_GITHUB_APP_INSTALL_ID || '',
    hooksSecret: process.env.RSSHCOOL_API_GITHUB_HOOKS_SECRET || 'hooks_secret',
  },
  roles: {
    adminTeams: process.env.RSSCHOOL_ADMIN_TEAMS
      ? process.env.RSSCHOOL_ADMIN_TEAMS.split(',')
      : ['rsschool-dev-team@rolling-scopes'],
    hirers: process.env.RSSHCOOL_API_HIRERS ? process.env.RSSHCOOL_API_HIRERS.split(',') : [],
  },
  isDevMode: process.env.NODE_ENV !== 'production',
  pg: {
    host: process.env.RSSHCOOL_API_PG_HOST || '',
    username: process.env.RSSHCOOL_API_PG_USERNAME || '',
    password: process.env.RSSHCOOL_API_PG_PASSWORD || '',
    database: process.env.RSSHCOOL_API_PG_DATABASE || 'rs_school',
  },
  aws: {
    secretAccessKey: process.env.RSSHCOOL_API_AWS_SECRET_ACCESS_KEY || '',
    accessKeyId: process.env.RSSHCOOL_API_AWS_ACCESS_KEY_ID || '',
    region: process.env.RSSHCOOL_API_AWS_REGION || '',
    restApiUrl: process.env.RSSHCOOL_API_AWS_TASK_API_URL || '',
    restApiKey: process.env.RSSHCOOL_API_AWS_TASK_API_KEY || '',
  },
  integrations: {
    heroes: {
      url: '', // turn off.
      username: process.env.RSSHCOOL_API_INTEGRATIONS_HEROES_USERNAME || '',
      password: process.env.RSSHCOOL_API_INTEGRATIONS_HEROES_PASSWORD || '',
    },
  },
  name: 'rsschool-api',
  port: parseInt(process.env.NODE_PORT || '3001', 10),
  rateLimit: {
    intervalMin: 5,
    max: 100,
  },
  sessionAge: 1000 * 60 * 60 * 24 * 2,
  sessionKey: process.env.RSSHCOOL_API_SESSION_KEY || 'secret-session-key',
};
