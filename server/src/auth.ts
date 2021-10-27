import passport from 'koa-passport';
import { Strategy as GitHubStrategy } from 'passport-github';
import { config } from './config';
import { createUser } from './rules';
import { ILogger } from './logger';

export function setupPassport(logger: ILogger) {
  passport.use(
    new GitHubStrategy(
      {
        callbackURL: config.auth.callback,
        clientID: config.auth.github_client_id,
        clientSecret: config.auth.github_client_secret,
        scope: ['read:user', 'user:email'],
      },
      (_1: string, _2, profile, cb) => {
        logger.info('request user');
        createUser(profile)
          .then(result => {
            logger.info({ userId: result.id }, 'Created user');
            cb(null, result);
          })
          .catch(err => {
            logger.error(err, 'Failed to create user');
            cb(err, undefined);
          });
      },
    ),
  );
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser<any, any>((obj, cb) => cb(null, obj));
  return passport;
}
