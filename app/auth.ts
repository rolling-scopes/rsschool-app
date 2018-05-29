import * as octokit from '@octokit/rest';
import * as passport from 'koa-passport';
import { Profile, Strategy as GitHubStrategy } from 'passport-github';
import { config } from './config';
import { ILogger } from './logger';
import { IUser, IUserSession, UserDocument } from './models';

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

async function initializeUser(profile: Profile, teams: octokit.AnyResponse): Promise<IUserSession> {
    const id = profile.username!;
    const result = await UserDocument.findById(id).exec();
    const roles = getRoles(getTeamIds(teams));
    if (result === null) {
        const user: IUser = {
            _id: id,
            profile: {
                emails: profile.emails,
                familyName: profile.name ? profile.name.familyName : '',
                givenName: profile.name ? profile.name.givenName : '',
            },
            roles,
        };
        const createdUser = await UserDocument.create(user);
        return {
            _id: createdUser.id,
            roles: createdUser.roles,
        };
    }
    result.roles = roles;
    const savedUser = await result.save();
    return { _id: savedUser.id, roles: savedUser.roles };
}

export function setupPassport(_1: ILogger) {
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
                    .then(teams => initializeUser(profile, teams).then(result => cb(null, result)))
                    .catch(error => cb(error, null));
            },
        ),
    );
    passport.serializeUser((user, cb) => cb(null, user));
    passport.deserializeUser((obj, cb) => cb(null, obj));
    return passport;
}
