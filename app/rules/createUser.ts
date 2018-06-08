import { config } from '../config';
import { IUser, IUserSession, saveUserSignupFeedAction, UserModel } from '../models';

const adminTeams: string[] = config.roles.adminTeams;
const mentorTeams: string[] = config.roles.mentorTeams;

type Profile = {
    username?: string;
    name?: {
        givenName: string;
        familyName: string;
    };
    emails?: { value: string; primary: boolean }[];
};

function getRole(teamIds: string[]) {
    if (mentorTeams.some(team => teamIds.includes(team))) {
        return 'mentor';
    }
    return 'student';
}

function getAdminStatus(teamIds: string[]): boolean {
    return adminTeams.some(team => teamIds.includes(team));
}

function getPrimaryEmail(emails: Array<{ value: string; primary: boolean }>) {
    return emails.filter(email => email.primary);
}

export async function createUser(profile: Profile, teamsIds: string[]): Promise<IUserSession> {
    const id = profile.username!;
    const result = await UserModel.findById(id).exec();

    const role = getRole(teamsIds);
    const isAdmin = getAdminStatus(teamsIds);
    if (result === null) {
        const user: IUser = {
            _id: id,
            isAdmin,
            participations: [],
            profile: {
                // We support only 1 email for now and let's select primary only
                emails: getPrimaryEmail((profile.emails as any) || []),
                firstName: profile.name ? profile.name.givenName : '',
                githubId: id,
                lastName: profile.name ? profile.name.familyName : '',
            },
            role,
        };
        const [createdUser] = await Promise.all([
            UserModel.create(user),
            saveUserSignupFeedAction(id, {
                text: 'Signed Up',
            }),
        ]);
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
