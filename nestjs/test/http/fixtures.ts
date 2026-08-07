import { sign } from 'jsonwebtoken';
import { AuthUser, JwtToken } from 'src/auth/auth-user.model';
import { ConfigService } from 'src/config';
import { TEST_HOST } from './harness';

export const TEST_JWT_SECRET = 'test-jwt-secret';
export const ROOT_USERNAME = 'cloud-admin';
export const ROOT_PASSWORD = 'cloud-password';
export const WEBHOOK_SECRET = 'test-activity-webhook';

/** Static ConfigService stand-in with everything the auth stack reads. */
export const testConfig = {
  auth: {
    github: {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      callbackUrl: 'http://localhost:3002/auth/github/callback',
      scope: ['user:email'],
      activityWebhookSecret: WEBHOOK_SECRET,
      integrationSiteToken: '',
    },
    dev: { username: 'dev-user', admin: false },
    jwt: { secretKey: TEST_JWT_SECRET },
  },
  users: {
    root: { username: ROOT_USERNAME, password: ROOT_PASSWORD },
    admins: [],
    hirers: [],
  },
  host: TEST_HOST,
  isDev: true,
} as unknown as ConfigService;

export function createTestUser(admin = false): AuthUser {
  return new AuthUser({ id: 1, githubId: 'octocat', students: [], mentors: [], courseUsers: [] }, [], admin);
}

export function signTestJwt(payload: Partial<JwtToken> = {}, options: { expiresIn?: string } = {}): string {
  const token: JwtToken = { id: 1, githubId: 'octocat', isAdmin: false, isHirer: false, ...payload };
  return sign(token, TEST_JWT_SECRET, options.expiresIn ? { expiresIn: options.expiresIn } : {});
}
