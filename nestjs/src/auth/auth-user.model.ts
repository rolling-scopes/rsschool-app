import { CourseTask } from '@entities/courseTask';
import { CourseUser } from '@entities/courseUser';
import { User } from '@entities/user';

export enum Role {
  Admin = 'admin',
  User = 'user',
}

export type CourseRoles = Record<string, CourseRole[]>;

export const enum CourseRole {
  taskOwner = 'taskOwner',
  juryActivist = 'juryActivist',
  manager = 'manager',
  supervisor = 'supervisor',
  student = 'student',
  mentor = 'mentor',
}

export class AuthUser {
  public readonly roles: Record<string, 'mentor' | 'student'>;
  public readonly isAdmin: boolean;
  public readonly isHirer: boolean;
  public readonly id: number;
  public readonly coursesRoles: CourseRoles;
  public readonly appRoles: Role[];
  public readonly githubId: string;

  constructor(user: Partial<User>, courseTasks: CourseTask[], admin: boolean) {
    const roles: { [key: string]: 'student' | 'mentor' } = {};
    const courseRoles: CourseRoles = {};

    user.students?.forEach(student => {
      roles[student.courseId] = 'student';
      courseRoles[student.courseId] = [CourseRole.student];
    });
    user.mentors?.forEach(mentor => {
      roles[mentor.courseId] = 'mentor';
      courseRoles[mentor.courseId] = [CourseRole.mentor];
    });

    const userId = user.id;

    const coursesRoles = this.populateCourseRoles(courseRoles, user.courseUsers ?? [], courseTasks);

    this.id = userId;
    this.isAdmin = admin;
    this.githubId = user.githubId;
    this.appRoles = [admin ? Role.Admin : Role.User];
    this.roles = roles;
    this.coursesRoles = coursesRoles;
    return this;
  }

  private populateCourseRoles(courseRoles: CourseRoles, courseUsers: CourseUser[], taskOwner: CourseTask[]) {
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
      }, courseRoles);
  }
}
