import { ConfigService as NestConfigService } from '@nestjs/config';
import { ConfigService } from './config.service';

/**
 * Builds a minimal NestConfigService stand-in whose `get(key, fallback?)`
 * resolves from `values`, mirroring @nestjs/config semantics: when the key is
 * absent and a default is provided, the default is returned; otherwise undefined.
 */
function makeNestConfig(values: Record<string, unknown>): NestConfigService {
  return {
    get: vi.fn((key: string, defaultValue?: unknown) => {
      if (key in values) return values[key];
      return defaultValue;
    }),
  } as unknown as NestConfigService;
}

describe('ConfigService', () => {
  describe('when every env value is provided', () => {
    let service: ConfigService;

    beforeEach(() => {
      service = new ConfigService(
        makeNestConfig({
          RSSHCOOL_AUTH_GITHUB_CLIENT_ID: 'client-id',
          RSSHCOOL_AUTH_GITHUB_CLIENT_SECRET: 'client-secret',
          RSSHCOOL_AUTH_GITHUB_CALLBACK: 'https://callback',
          RSSHCOOL_AUTH_GITHUB_WEBHOOK_ACTIVITY_SECRET: 'webhook-secret',
          RSSHCOOL_AUTH_GITHUB_INTEGRATION_SITE_TOKEN: 'site-token',
          RSSCHOOL_AUTH_DEV_USERNAME: 'dev-user',
          RSSCHOOL_AUTH_DEV_ADMIN: 'TRUE',
          RSSHCOOL_AUTH_JWT_SECRET_KEY: 'jwt-secret',
          RSSHCOOL_OPENAI_API_KEY: 'openai-key',
          RSSHCOOL_AWS_REGION: 'us-east-1',
          RSSHCOOL_AWS_ACCESS_KEY_ID: 'access-key',
          RSSHCOOL_AWS_SECRET_ACCESS_KEY: 'secret-access',
          RSSHCOOL_AWS_REST_API_URL: 'https://api',
          RSSHCOOL_AWS_REST_API_KEY: 'rest-key',
          RSSHCOOL_USERS_CLOUD_USERNAME: 'root',
          RSSHCOOL_USERS_CLOUD_PASSWORD: 'root-pass',
          RSSHCOOL_USERS_HIRERS: 'h1,h2',
          RSSHCOOL_USERS_ADMINS: 'a1,a2,a3',
          RSSHCOOL_SECURE_ENCRYPT_KEY: 'encrypt-key',
          RSSHCOOL_HOST: 'https://host',
          RS_ENV: 'staging',
        }),
      );
    });

    it('maps github auth config', () => {
      expect(service.auth.github).toEqual({
        clientId: 'client-id',
        clientSecret: 'client-secret',
        callbackUrl: 'https://callback',
        scope: ['user:email'],
        activityWebhookSecret: 'webhook-secret',
        integrationSiteToken: 'site-token',
      });
    });

    it('parses the dev admin flag case-insensitively', () => {
      expect(service.auth.dev).toEqual({ username: 'dev-user', admin: true });
    });

    it('maps jwt, openai, aws client and aws services config', () => {
      expect(service.auth.jwt.secretKey).toBe('jwt-secret');
      expect(service.openai).toEqual({ apiKey: 'openai-key' });
      expect(service.awsClient).toEqual({
        region: 'us-east-1',
        credentials: { accessKeyId: 'access-key', secretAccessKey: 'secret-access' },
      });
      expect(service.awsServices).toEqual({ restApiUrl: 'https://api', restApiKey: 'rest-key' });
    });

    it('splits comma-separated hirers and admins into arrays', () => {
      expect(service.users).toEqual({
        root: { username: 'root', password: 'root-pass' },
        hirers: ['h1', 'h2'],
        admins: ['a1', 'a2', 'a3'],
      });
    });

    it('maps secure, host and static buckets', () => {
      expect(service.secure).toEqual({ encryptKey: 'encrypt-key' });
      expect(service.host).toBe('https://host');
      expect(service.buckets).toEqual({ cdn: 'cdn.rs.school' });
    });

    it('resolves env to staging when RS_ENV is staging', () => {
      expect(service.env).toBe('staging');
    });
  });

  describe('when env values are missing', () => {
    let service: ConfigService;

    beforeEach(() => {
      service = new ConfigService(makeNestConfig({}));
    });

    it('falls back to empty strings for missing auth values', () => {
      expect(service.auth.github.clientId).toBe('');
      expect(service.auth.github.clientSecret).toBe('');
      expect(service.auth.github.callbackUrl).toBe('');
    });

    it('uses provided defaults for webhook secret and integration token', () => {
      expect(service.auth.github.activityWebhookSecret).toBe('activity-webhook');
      expect(service.auth.github.integrationSiteToken).toBe('');
    });

    it('defaults dev admin to false when flag is absent', () => {
      expect(service.auth.dev.admin).toBe(false);
      expect(service.auth.dev.username).toBe('');
    });

    it('defaults jwt secret and encrypt key to "secret"', () => {
      expect(service.auth.jwt.secretKey).toBe('secret');
      expect(service.secure.encryptKey).toBe('secret');
    });

    it('defaults aws region and empty credentials/services', () => {
      expect(service.awsClient.region).toBe('eu-central-1');
      expect(service.awsClient.credentials).toEqual({ accessKeyId: '', secretAccessKey: '' });
      expect(service.awsServices).toEqual({ restApiUrl: '', restApiKey: '' });
    });

    it('defaults openai key and host to empty strings', () => {
      expect(service.openai.apiKey).toBe('');
      expect(service.host).toBe('');
    });

    it('defaults hirers and admins to empty arrays', () => {
      expect(service.users.hirers).toEqual([]);
      expect(service.users.admins).toEqual([]);
    });
  });

  describe('dev admin flag parsing', () => {
    it('treats a non-"true" string as false', () => {
      const service = new ConfigService(makeNestConfig({ RSSCHOOL_AUTH_DEV_ADMIN: 'yes' }));
      expect(service.auth.dev.admin).toBe(false);
    });
  });

  describe('env resolution', () => {
    it('resolves to "local" in dev when RS_ENV is not staging', () => {
      // In the test runtime NODE_ENV is not "production", so isDev is true.
      const service = new ConfigService(makeNestConfig({ RS_ENV: 'production' }));
      expect(service.env).toBe(service.isDev ? 'local' : 'prod');
    });
  });

  describe('authWithDevUser', () => {
    it('does nothing when dev tools toggle is off', () => {
      const service = new ConfigService(makeNestConfig({ RSSCHOOL_AUTH_DEV_USERNAME: 'original' }));
      // devToolsToggle reads RSSCHOOL_DEV_TOOLS at field init; default test env keeps it off.
      Object.defineProperty(service, 'devToolsToggle', { value: false });

      service.authWithDevUser('hacker');

      expect(service.auth.dev.username).toBe('original');
    });

    it('overrides the dev username when the toggle is on', () => {
      const service = new ConfigService(makeNestConfig({ RSSCHOOL_AUTH_DEV_USERNAME: 'original' }));
      Object.defineProperty(service, 'devToolsToggle', { value: true });

      service.authWithDevUser('impersonated');

      expect(service.auth.dev.username).toBe('impersonated');
    });
  });
});
