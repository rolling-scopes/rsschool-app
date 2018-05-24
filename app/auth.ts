import * as octokit from '@octokit/rest';
import * as passport from 'koa-passport';
import { Strategy as GitHubStrategy } from 'passport-github';
import { config } from './config';
import { IUser } from './models';

const adminTeams: string[] = ['rsschool-dev-team@rolling-scopes'];
const mentorTeams: string[] = ['rsschool-dev-team@rolling-scopes'];
const studentTeams: string[] = [];

function getRoles(teamIds: string[]) {
    const result: Array<'admin' | 'student' | 'mentor'> = [];
    if (adminTeams.some(team => teamIds.includes(team))) {
        result.push('admin');
    }
    if (mentorTeams.some(team => teamIds.includes(team))) {
        result.push('mentor');
    }
    if (studentTeams.some(team => teamIds.includes(team))) {
        result.push('student');
    }
    return result;
}

function getTeamIds(teams: octokit.AnyResponse) {
    const data: Array<{ slug: string; organization: { login: string } }> = teams.data;
    return data.map(({ slug, organization }) => `${slug}@${organization.login}`);
}

function createUser(id: string, teams: octokit.AnyResponse): IUser {
    return { id, roles: getRoles(getTeamIds(teams)) };
}

export function setupPassport() {
    passport.use(
        new GitHubStrategy(
            {
                callbackURL: config.auth.callback,
                clientID: config.auth.github_client_id,
                clientSecret: config.auth.github_client_secret,
                scope: ['read:user', 'read:org'],
            },
            (accessToken: string, _, profile, cb) => {
                const github = new octokit();
                github.authenticate({
                    token: accessToken,
                    type: 'oauth',
                });
                github.users
                    .getTeams({})
                    .then(teams => cb(null, createUser(profile.id, teams)))
                    .catch(error => cb(error, null));
            },
        ),
    );
    passport.serializeUser((user, cb) => cb(null, user));
    passport.deserializeUser((obj, cb) => cb(null, obj));
    return passport;
}
