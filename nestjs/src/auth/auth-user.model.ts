import { CourseTask } from '@entities/courseTask';
import { CourseUser } from '@entities/courseUser';
import { AuthDetails } from './auth.repository';

export enum Role {
  Admin = 'admin',
  User = 'user',
}

export type CourseRoles = Record<string, CourseRole[]>;

export enum CourseRole {
  TaskOwner = 'taskOwner',
  Manager = 'manager',
  Supervisor = 'supervisor',
  Student = 'student',
  Mentor = 'mentor',
}

export interface CourseInfo {
  mentorId: number | null;
  studentId: number | null;
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

  constructor(user: AuthDetails, courseTasks: CourseTask[] = [], admin: boolean = false) {
    const roles: { [key: string]: 'student' | 'mentor' } = {};
    const courses: Record<number, CourseInfo> = {};

    user.students?.forEach(student => {
      roles[student.courseId] = 'student';
      const info = courses[student.courseId] ?? ({ mentorId: null, studentId: null, roles: [] } as CourseInfo);
      info.studentId = student.id;
      info.roles.push(CourseRole.Student);
      courses[student.courseId] = info;
    });
    user.mentors?.forEach(mentor => {
      roles[mentor.courseId] = 'mentor';
      const info = courses[mentor.courseId] ?? ({ mentorId: null, studentId: null, roles: [] } as CourseInfo);
      info.mentorId = mentor.id;
      info.roles.push(CourseRole.Mentor);
      courses[mentor.courseId] = info;
    });

    const userId = user.id;

    const coursesInfo = this.populateCourseInfo(courses, user.courseUsers ?? [], courseTasks);

    this.id = userId;
    this.isAdmin = admin;
    this.githubId = user.githubId;
    this.appRoles = [admin ? Role.Admin : Role.User];
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
      .flatMap(u => {
        const result: { courseId: number; role: CourseRole }[] = [];
        if (u.isManager) {
          result.push({ courseId: u.courseId, role: CourseRole.Manager });
        }
        if (u.isSupervisor) {
          result.push({ courseId: u.courseId, role: CourseRole.Supervisor });
        }
        return result;
      })
      .concat(taskOwner.map(t => ({ courseId: t.courseId, role: CourseRole.TaskOwner })))
      .reduce((acc, item) => {
        if (!acc[item.courseId]) {
          acc[item.courseId] = { mentorId: null, studentId: null, roles: [] } as CourseInfo;
        }
        if (!acc[item.courseId]?.roles.includes(item.role)) {
          acc[item.courseId]?.roles.push(item.role);
        }
        return acc;
      }, courseInfo);
  }

  public static getCourseDistinctRoles(user: AuthUser) {
    return [...new Set(Object.values(user.roles))];
  }
}
