import { config } from '../config';
import { IUserSession, Course } from '../models';
import { User } from '../models';
import { userService } from '../services';
import { getManager } from 'typeorm';

const adminTeams: string[] = config.roles.adminTeams;

type Profile = {
  username?: string;
  name?: {
    givenName: string;
    familyName: string;
  };
  emails?: { value: string; primary: boolean }[];
};

function getAdminStatus(teamIds: string[]): boolean {
  return adminTeams.some(team => teamIds.includes(team));
}

function getPrimaryEmail(emails: Array<{ value: string; primary: boolean }>) {
  return emails.filter(email => email.primary);
}

export async function createUser(profile: Profile, teamsIds: string[]): Promise<IUserSession> {
  const id = profile.username!;
  const result = await userService.getFullUserByGithubId(id);

  // const role = getRole(teamsIds);
  const isAdmin = getAdminStatus(teamsIds);

  if (result == null) {
    const email = getPrimaryEmail((profile.emails as any) || [])[0];

    const user: User = {
      githubId: id.toLowerCase(),
      contactsEmail: email ? email.value : undefined,
      firstName: profile.name ? profile.name.givenName : '',
      lastName: profile.name ? profile.name.familyName : '',
      educationHistory: [],
      employmentHistory: [],
      externalAccounts: [],
      mentors: [],
      students: [],
      givenFeedback: [],
      receivedFeedback: [],
      activist: false,
    };
    const createdUser = await getManager().save(User, user);
    const userId = createdUser.id!;
    return {
      id: userId,
      githubId: createdUser.githubId.toLowerCase(),
      isAdmin,
      roles: {},
    };
  }
  const roles: { [key: number]: 'student' | 'mentor' } = {};
  result.students!.forEach(student => {
    roles[(student.course as Course).id] = 'student';
  });
  result.mentors!.forEach(mentor => {
    roles[(mentor.course as Course).id] = 'mentor';
  });
  return { roles, id: result.id!, githubId: result.githubId.toLowerCase(), isAdmin };
}
