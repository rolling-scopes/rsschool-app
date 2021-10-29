import { getRepository } from 'typeorm';
import { Profile } from 'passport-github2';
import { flatMap } from 'lodash';
import { config } from '../config';
import { Course, IUserSession, CourseRoles, User, CourseTask, CourseUser, CourseRole } from '../models';
import { userService } from '../services';

const hirers: string[] = config.roles.hirers;

function getPrimaryEmail(emails: Array<{ value: string; primary?: boolean }>) {
  return emails.filter(email => email.primary);
}

export async function createUser(profile: Profile, admin: boolean = false): Promise<IUserSession> {
  const username = profile.username!.toLowerCase();
  const providerUserId = profile.id.toString();
  const provider = profile.provider.toString();
  const result =
    (provider ? await userService.getUserByProvider(provider, providerUserId) : undefined) ??
    (await userService.getFullUserByGithubId(username));

  if (result != null && provider && !result.provider) {
    await userService.saveUser({
      id: result.id,
      provider: provider,
      providerUserId: providerUserId,
      githubId: username,
    });
  }

  const isAdmin = config.app.admins.includes(username) || admin;
  const isHirer = hirers.includes(username);
  if (result == null) {
    const email = getPrimaryEmail(profile.emails || [])[0];

    const user: Partial<User> = {
      githubId: username,
      providerUserId,
      provider,
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
      discord: null,
      activist: false,
      lastActivityTime: Date.now(),
      isActive: true,
      courseManagers: [],
      profilePermissions: null,
      opportunitiesConsent: false,
    };
    const createdUser = await getRepository(User).save(user);
    const userId = createdUser.id;
    return {
      id: userId,
      githubId: createdUser.githubId.toLowerCase(),
      isAdmin,
      isHirer,
      roles: {},
      coursesRoles: {},
    };
  }
  const roles: { [key: string]: 'student' | 'mentor' } = {};
  result.students?.forEach(student => {
    roles[(student.course as Course).id] = 'student';
  });
  result.mentors?.forEach(mentor => {
    roles[(mentor.course as Course).id] = 'mentor';
  });

  const userId = result.id!;
  const [taskOwner, courseUsers] = await Promise.all([
    getRepository(CourseTask)
      .createQueryBuilder('courseTask')
      .select('"courseTask"."id" AS "courseTaskId", "course"."id" AS "courseId"')
      .leftJoin(Course, 'course', '"course"."id" = "courseTask"."courseId"')
      .leftJoin(User, 'user', '"user"."id" = "courseTask"."taskOwnerId"')
      .where(`"courseTask"."checker" = 'taskOwner' AND "user"."githubId" = '${username}'`)
      .getRawMany(),
    getRepository(CourseUser)
      .createQueryBuilder('courseUser')
      .where('"courseUser"."userId" = :userId', { userId })
      .getMany(),
  ] as const);

  const coursesRoles = flatMap(courseUsers, u => {
    const result = [];
    if (u.isJuryActivist) {
      result.push({ courseId: u.courseId, role: CourseRole.juryActivist });
    }
    if (u.isManager) {
      result.push({ courseId: u.courseId, role: CourseRole.manager });
    }
    return result;
  })
    .concat(taskOwner.map(t => ({ courseId: t.courseId, role: CourseRole.taskOwner })))
    .reduce((acc, item) => {
      if (!acc[item.courseId]) {
        acc[item.courseId] = [];
      }
      acc[item.courseId]!.push(item.role);
      return acc;
    }, {} as CourseRoles);

  return {
    roles,
    isAdmin,
    isHirer,
    id: userId,
    coursesRoles,
    githubId: result.githubId.toLowerCase(),
  };
}
