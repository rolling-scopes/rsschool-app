import * as octokit from '@octokit/rest';
import * as passport from 'koa-passport';
import { Strategy as GitHubStrategy } from 'passport-github';
import { config } from './config';
import { createUser } from './rules';
import { ILogger } from './logger';
import { connection, STATES } from 'mongoose';

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
                if (connection.readyState !== STATES.connected) {
                    cb({ message: 'MongoDB connection is not available' }, null);
                    return;
                }
                const github = new octokit();
                github.authenticate({
                    token: accessToken,
                    type: 'oauth',
                });
                github.users
                    .getTeams({})
                    .then(teams =>
                        createUser(profile as any, getTeamIds(teams.data)).then(result => {
                            logger.info({ userId: result._id }, 'Created user');
                            cb(null, result);
                        }),
                    )
                    .catch(err => {
                        logger.error(err, 'Failed to create user');
                        cb(err, null);
                    });
            },
        ),
    );
    passport.serializeUser((user, cb) => cb(null, user));
    passport.deserializeUser((obj, cb) => cb(null, obj));
    return passport;
}
