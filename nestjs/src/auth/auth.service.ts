import { CourseTask } from '@entities/courseTask';
import { CourseUser } from '@entities/courseUser';
import { CourseRole, CourseRoles } from '@entities/session';
import { User } from '@entities/user';
import { Injectable } from '@nestjs/common';
import { Profile } from 'passport';
import { CourseTaskService, CourseUserService } from '../course';
import { UserService } from '../user/user.service';
import { JwtService } from './jwt.service';
import { RequestWithUser } from './models';

@Injectable()
export class AuthService {
  private readonly admins: string[] = [];
  private readonly hirers: string[] = [];

  constructor(
    private readonly jwtService: JwtService,
    readonly courseTaskService: CourseTaskService,
    readonly courseUserService: CourseUserService,
    readonly userService: UserService,
  ) {}

  public async createUser(profile: Profile, admin = false) {
    const username = profile.username?.toLowerCase();
    const providerUserId = profile.id.toString();
    const provider = profile.provider.toString();
    const result =
      (provider ? await this.userService.getUserByProvider(provider, providerUserId) : undefined) ??
      (await this.userService.getFullUserByGithubId(username));

    if (result != null && (result.githubId !== username || !result.provider)) {
      await this.userService.saveUser({
        id: result.id,
        provider: provider,
        providerUserId: providerUserId,
        githubId: username,
      });
    }

    const isAdmin = this.admins.includes(username) || admin;
    const isHirer = this.hirers.includes(username);

    if (result == null) {
      const [email] = profile.emails?.filter((email: any) => !!email.primary) ?? [];

      const user: Partial<User> = {
        githubId: username,
        providerUserId,
        provider,
        primaryEmail: email ? email.value : undefined,
        firstName: profile.name ? profile.name.givenName : '',
        lastName: profile.name ? profile.name.familyName : '',
        lastActivityTime: Date.now(),
      };
      const createdUser = await this.userService.saveUser(user);
      const userId = createdUser.id;
      return {
        id: userId,
        githubId: username,
        isAdmin,
        isHirer,
        roles: {},
        coursesRoles: {},
      };
    }
    const roles: { [key: string]: 'student' | 'mentor' } = {};
    result.students?.forEach(student => {
      roles[student.course.id] = 'student';
    });
    result.mentors?.forEach(mentor => {
      roles[mentor.course.id] = 'mentor';
    });

    const userId = result.id;
    const [taskOwner, courseUsers] = await Promise.all([
      this.courseTaskService.getByOwner(username),
      this.courseUserService.getByUserId(userId),
    ] as const);

    const coursesRoles = this.getCourseRoles(courseUsers, taskOwner);

    return {
      roles,
      isAdmin,
      isHirer,
      id: userId,
      coursesRoles,
      githubId: username,
    };
  }

  public validateGithub(req: RequestWithUser) {
    if (!req.user) {
      return null;
    }

    return this.jwtService.createToken(req.user);
  }

  private getCourseRoles(courseUsers: CourseUser[], taskOwner: CourseTask[]) {
    return courseUsers
      .flatMap(u => {
        const result: { courseId: number; role: CourseRole }[] = [];
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
        if (!acc[item.courseId].includes(item.role)) {
          acc[item.courseId].push(item.role);
        }
        return acc;
      }, {} as CourseRoles);
  }
}
