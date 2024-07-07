import { CourseTask } from '@entities/courseTask';
import { CourseUser } from '@entities/courseUser';
import { CourseRole } from '@entities/session';
import type { AuthDetails } from './auth.service';

export enum Role {
  Admin = 'admin',
  User = 'user',
  Hirer = 'hirer',
}

export { CourseRole };

export type CourseRoles = Record<string, CourseRole[]>;

export interface CourseInfo {
  mentorId?: number;
  studentId?: number;
  isExpelled?: boolean;
  roles: CourseRole[];
}

export class AuthUser {
  public readonly roles: Record<string, 'mentor' | 'student'>;
  public readonly isAdmin: boolean;
  public readonly isHirer: boolean;
  public readonly id: number;
  public readonly appRoles: Role[];
  public readonly githubId: string;
  public readonly courses: Record<number, CourseInfo>;

  constructor(user: AuthDetails, courseTasks: CourseTask[] = [], admin: boolean = false, hirer: boolean = false) {
    const roles: { [key: string]: 'student' | 'mentor' } = {};
    const courses: Record<number, CourseInfo> = {};

    user.students?.forEach(student => {
      roles[student.courseId] = 'student';
      const info = courses[student.courseId] ?? { roles: [] };
      info.studentId = student.id;
      info.roles.push(CourseRole.Student);
      info.isExpelled = student.isExpelled || undefined;
      courses[student.courseId] = info;
    });
    user.mentors?.forEach(mentor => {
      roles[mentor.courseId] = 'mentor';
      const info = courses[mentor.courseId] ?? { roles: [] };
      info.mentorId = mentor.id;
      info.roles.push(CourseRole.Mentor);
      courses[mentor.courseId] = info;
    });

    const userId = user.id;

    const coursesInfo = this.populateCourseInfo(courses, user.courseUsers ?? [], courseTasks);

    this.id = userId;
    this.isAdmin = admin;
    this.isHirer = hirer;
    this.githubId = user.githubId;
    this.appRoles = [admin ? Role.Admin : Role.User, this.isHirer ? Role.Hirer : null].filter(Boolean);
    this.roles = roles;
    this.courses = coursesInfo;
    return this;
  }

  static createAdmin() {
    return new AuthUser({ courseUsers: [], githubId: '', id: 0, mentors: [], students: [] }, [], true);
  }

  private populateCourseInfo(
    courseInfo: Record<number, CourseInfo>,
    courseUsers: CourseUser[],
    taskOwner: CourseTask[],
  ) {
    return courseUsers
      .flatMap(({ courseId, isDementor, isManager, isSupervisor }) => {
        const result: { courseId: number; role: CourseRole }[] = [];
        if (isManager) {
          result.push({ courseId, role: CourseRole.Manager });
        }
        if (isSupervisor) {
          result.push({ courseId, role: CourseRole.Supervisor });
        }
        if (isDementor) {
          result.push({ courseId, role: CourseRole.Dementor });
        }
        return result;
      })
      .concat(taskOwner.map(({ courseId }) => ({ courseId, role: CourseRole.TaskOwner })))
      .reduce((acc, { courseId, role }) => {
        if (!acc[courseId]) {
          acc[courseId] = { roles: [] };
        }
        if (!acc[courseId]?.roles.includes(role)) {
          acc[courseId]?.roles.push(role);
        }
        return acc;
      }, courseInfo);
  }
}
