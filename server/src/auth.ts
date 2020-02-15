import { Octokit } from '@octokit/rest';
import passport from 'koa-passport';
import { Strategy as GitHubStrategy } from 'passport-github';
import { config } from './config';
import { createUser } from './rules';
import { ILogger } from './logger';

type Teams = { slug: string; organization: { login: string } }[];

function getTeamIds(data: Teams) {
  return data.map(({ slug, organization }) => `${slug}@${organization.login}`);
}

export function setupPassport(logger: ILogger) {
  passport.use(
    new GitHubStrategy(
      {
        callbackURL: config.auth.callback,
        clientID: config.auth.github_client_id,
        clientSecret: config.auth.github_client_secret,
        scope: ['read:user', 'read:org', 'user:email'],
      },
      (accessToken: string, _, profile, cb) => {
        logger.info('token', { accessToken });
        const github = new Octokit();
        github.authenticate({ token: accessToken, type: 'oauth' });

        logger.info('request users');
        github.teams
          .listForAuthenticatedUser()
          .then(teams =>
            createUser(profile as any, getTeamIds(teams.data)).then(result => {
              logger.info({ userId: result.id }, 'Created user');
              cb(null, result);
            }),
          )
          .catch(err => {
            logger.error(err, 'Failed to create user');
            cb(err, undefined);
          });
      },
    ),
  );
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((obj, cb) => cb(null, obj));
  return passport;
}
