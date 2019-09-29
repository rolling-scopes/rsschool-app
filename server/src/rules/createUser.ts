import { getRepository } from 'typeorm';
import { config } from '../config';
import { Course, IUserSession, User } from '../models';
import { userService } from '../services';

const adminTeams: string[] = config.roles.adminTeams;
const hirers: string[] = config.roles.hirers;

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

export async function createUser(profile: Profile, teamsIds: string[] = []): Promise<IUserSession> {
  const id = profile.username!.toLowerCase();
  const result = await userService.getFullUserByGithubId(id);

  // TODO: add taskowner role
  const isAdmin = getAdminStatus(teamsIds);
  const isHirer = hirers.includes(id);
  if (result == null) {
    const email = getPrimaryEmail((profile.emails as any) || [])[0];

    const user: User = {
      githubId: id,
      primaryEmail: email ? email.value : undefined,
      firstName: profile.name ? profile.name.givenName : '',
      lastName: profile.name ? profile.name.familyName : '',
      educationHistory: [],
      employmentHistory: [],
      externalAccounts: [],
      mentors: [],
      students: [],
      givenFeedback: [],
      receivedFeedback: [],
      registries: [],
      activist: false,
      lastActivityTime: Date.now(),
      isActive: true,
      courseManagers: [],
    };
    const createdUser = await getRepository(User).save(user);
    const userId = createdUser.id!;
    return {
      id: userId,
      githubId: createdUser.githubId.toLowerCase(),
      isAdmin,
      isHirer,
      isActivist: false,
      roles: {},
    };
  }
  const roles: { [key: string]: 'student' | 'mentor' | 'coursemanager' | 'taskowner' } = {};
  result.students!.forEach(student => {
    roles[(student.course as Course).id] = 'student';
  });
  result.mentors!.forEach(mentor => {
    roles[(mentor.course as Course).id] = 'mentor';
  });
  result.courseManagers!.forEach(courseManager => {
    roles[(courseManager.course as Course).id] = 'coursemanager';
  });
  return {
    roles,
    id: result.id!,
    isActivist: result.activist,
    githubId: result.githubId.toLowerCase(),
    isAdmin,
    isHirer,
  };
}
