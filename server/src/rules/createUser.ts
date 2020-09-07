import { getRepository } from 'typeorm';
import { flatMap } from 'lodash';
import { config } from '../config';
import { Course, IUserSession, CourseRoles, User, CourseTask, CourseUser, CourseRole } from '../models';
import { userService } from '../services';

const hirers: string[] = config.roles.hirers;

type Profile = {
  username?: string;
  name?: {
    givenName: string;
    familyName: string;
  };
  emails?: { value: string; primary?: boolean }[];
};

function getPrimaryEmail(emails: Array<{ value: string; primary?: boolean }>) {
  return emails.filter(email => email.primary);
}

export async function createUser(profile: Profile, admin: boolean = false): Promise<IUserSession> {
  const id = profile.username!.toLowerCase();
  const result = await userService.getFullUserByGithubId(id);

  const isAdmin = config.app.admins.includes(id) || admin;
  const isHirer = hirers.includes(id);
  if (result == null) {
    const email = getPrimaryEmail(profile.emails || [])[0];

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
      profilePermissions: null,
      opportunitiesConsent: false,
    };
    const createdUser = await getRepository(User).save(user);
    const userId = createdUser.id!;
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
      .where(`"courseTask"."checker" = 'taskOwner' AND "user"."githubId" = '${id}'`)
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
