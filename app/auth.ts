import * as octokit from '@octokit/rest';
import * as passport from 'koa-passport';
import { Profile, Strategy as GitHubStrategy } from 'passport-github';
import { config } from './config';
import { ILogger } from './logger';
import { IUser, IUserSession, UserDocument } from './models';

const adminTeams: string[] = ['rsschool-dev-team@rolling-scopes'];
const mentorTeams: string[] = ['rsschool-dev-team@rolling-scopes'];

function getRole(teamIds: string[]) {
    if (mentorTeams.some(team => teamIds.includes(team))) {
        return 'mentor';
    }
    return 'student';
}

function getAdminStatus(teamIds: string[]): boolean {
    return adminTeams.some(team => teamIds.includes(team));
}

function getTeamIds(teams: octokit.AnyResponse) {
    const data: Array<{ slug: string; organization: { login: string } }> = teams.data;
    return data.map(({ slug, organization }) => `${slug}@${organization.login}`);
}

function getPrimaryEmail(emails: Array<{ value: string; primary: boolean }>) {
    return emails.filter(email => email.primary);
}

async function initializeUser(profile: Profile, teams: octokit.AnyResponse): Promise<IUserSession> {
    const id = profile.username!;
    const result = await UserDocument.findById(id).exec();
    const teamsIds = getTeamIds(teams);

    const role = getRole(teamsIds);
    const isAdmin = getAdminStatus(teamsIds);
    if (result === null) {
        const user: IUser = {
            _id: id,
            courses: [],
            isAdmin,
            profile: {
                // We support only 1 email for now and let's select primary only
                emails: getPrimaryEmail((profile.emails as any) || []),
                firstName: profile.name ? profile.name.givenName : '',
                lastName: profile.name ? profile.name.familyName : '',
            },
            role,
        };
        const createdUser = await UserDocument.create(user);
        return {
            _id: createdUser.id,
            isAdmin,
            role: createdUser.role,
        };
    }
    result.role = role;
    const savedUser = await result.save();
    return { _id: savedUser.id, role: savedUser.role, isAdmin };
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
