import { CourseTask } from '@entities/courseTask';
import { CourseUser } from '@entities/courseUser';
import { User } from '@entities/user';

export enum Role {
  Admin = 'admin',
  User = 'user',
}

export type CourseRoles = Record<string, CourseRole[]>;

export const enum CourseRole {
  TaskOwner = 'taskOwner',
  JuryActivist = 'juryActivist',
  Manager = 'manager',
  Supervisor = 'supervisor',
  Student = 'student',
  Mentor = 'mentor',
}

export interface CourseInfo {
  mentorId: number;
  studentId: number;
  roles: CourseRole[];
}

export class AuthUser {
  public readonly roles: Record<string, 'mentor' | 'student'>;
  public readonly isAdmin: boolean;
  public readonly isHirer: boolean;
  public readonly id: number;
  public readonly coursesRoles: CourseRoles;
  public readonly appRoles: Role[];
  public readonly githubId: string;
  public readonly courses: Record<number, CourseInfo>;

  constructor(user: Partial<User>, courseTasks: CourseTask[], admin: boolean) {
    const roles: { [key: string]: 'student' | 'mentor' } = {};
    const courseRoles: CourseRoles = {};
    const courses: Record<number, CourseInfo> = {};

    user.students?.forEach(student => {
      roles[student.courseId] = 'student';
      courseRoles[student.courseId] = [CourseRole.Student];
      const info = courses[student.courseId] ?? ({ mentorId: null, studentId: null, roles: [] } as CourseInfo);
      info.studentId = student.id;
      info.roles.push(CourseRole.Student);
      courses[student.courseId] = info;
    });
    user.mentors?.forEach(mentor => {
      roles[mentor.courseId] = 'mentor';
      courseRoles[mentor.courseId] = [CourseRole.Mentor];

      const info = courses[mentor.courseId] ?? ({ mentorId: null, studentId: null, roles: [] } as CourseInfo);
      info.mentorId = mentor.id;
      info.roles.push(CourseRole.Mentor);
      courses[mentor.courseId] = info;
    });

    const userId = user.id;

    const coursesRoles = this.populateCourseRoles(courseRoles, user.courseUsers ?? [], courseTasks);
    const coursesInfo = this.populateCourseInfo(courses, user.courseUsers ?? [], courseTasks);

    this.id = userId;
    this.isAdmin = admin;
    this.githubId = user.githubId;
    this.appRoles = [admin ? Role.Admin : Role.User];
    this.roles = roles;
    this.coursesRoles = coursesRoles;
    this.courses = coursesInfo;
    return this;
  }

  private populateCourseInfo(
    courseInfo: Record<number, CourseInfo>,
    courseUsers: CourseUser[],
    taskOwner: CourseTask[],
  ) {
    return courseUsers
      .flatMap(u => {
        const result: { courseId: number; role: CourseRole }[] = [];
        if (u.isJuryActivist) {
          result.push({ courseId: u.courseId, role: CourseRole.JuryActivist });
        }
        if (u.isManager) {
          result.push({ courseId: u.courseId, role: CourseRole.Manager });
        }
        return result;
      })
      .concat(taskOwner.map(t => ({ courseId: t.courseId, role: CourseRole.TaskOwner })))
      .reduce((acc, item) => {
        if (!acc[item.courseId]) {
          acc[item.courseId] = { mentorId: null, studentId: null, roles: [] } as CourseInfo;
        }
        if (!acc[item.courseId].roles.includes(item.role)) {
          acc[item.courseId].roles.push(item.role);
        }
        return acc;
      }, courseInfo);
  }

  private populateCourseRoles(courseRoles: CourseRoles, courseUsers: CourseUser[], taskOwner: CourseTask[]) {
    return courseUsers
      .flatMap(u => {
        const result: { courseId: number; role: CourseRole }[] = [];
        if (u.isJuryActivist) {
          result.push({ courseId: u.courseId, role: CourseRole.JuryActivist });
        }
        if (u.isManager) {
          result.push({ courseId: u.courseId, role: CourseRole.Manager });
        }
        return result;
      })
      .concat(taskOwner.map(t => ({ courseId: t.courseId, role: CourseRole.TaskOwner })))
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
