import * as octokit from '@octokit/rest';
import * as passport from 'koa-passport';
import { Strategy as GitHubStrategy } from 'passport-github';
import { config } from './config';
import { createUser } from './rules';

type Teams = { slug: string; organization: { login: string } }[];

function getTeamIds(data: Teams) {
    return data.map(({ slug, organization }) => `${slug}@${organization.login}`);
}

export function setupPassport() {
    passport.use(
        new GitHubStrategy(
            {
                callbackURL: config.auth.callback,
                clientID: config.auth.github_client_id,
                clientSecret: config.auth.github_client_secret,
                scope: ['read:user', 'read:org', 'user:email'],
            },
            (accessToken: string, _, profile, cb) => {
                const github = new octokit();
                github.authenticate({
                    token: accessToken,
                    type: 'oauth',
                });
                github.users
                    .getTeams({})
                    .then(teams => createUser(profile as any, getTeamIds(teams.data)).then(result => cb(null, result)))
                    .catch(error => cb(error, null));
            },
        ),
    );
    passport.serializeUser((user, cb) => cb(null, user));
    passport.deserializeUser((obj, cb) => cb(null, obj));
    return passport;
}
