import { config } from '../config';
import { IUserSession } from '../models';
import { User } from '../models';
import { userService } from '../services';
import { getManager } from 'typeorm';

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
  const result = await userService.getUserByGithubId(id);

  const role = getRole(teamsIds);
  const isAdmin = getAdminStatus(teamsIds);

  if (result == null) {
    const email = getPrimaryEmail((profile.emails as any) || [])[0];

    const user: User = {
      githubId: id,
      contactsEmail: email ? email.value : undefined,
      firstName: profile.name ? profile.name.givenName : '',
      lastName: profile.name ? profile.name.familyName : '',
      educationHistory: [],
      employmentHistory: [],
      externalAccounts: [],
    };
    const createdUser = await getManager().save(User, user);
    const userId = createdUser.id!;
    return {
      id: userId,
      githubId: createdUser.githubId,
      isAdmin,
      role,
    };
  }
  return { role, id: result.id!, githubId: result.githubId, isAdmin };
}
