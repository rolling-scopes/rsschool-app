import { Injectable } from '@nestjs/common';
import { AuthUser, CourseRole, Role } from '../auth';
import { StudentsService } from './students';

export enum Operation {
  Create,
  Read,
  Update,
  Delete,
}

@Injectable()
export class CourseAccessService {
  constructor(private studentsService: StudentsService) {}

  public async canAccessStudent(user: AuthUser, studentId: number): Promise<boolean> {
    const student = await this.studentsService.getById(studentId);
    if (student == null) {
      return false;
    }

    if (user.appRoles?.includes(Role.Admin)) {
      return true;
    }

    const { courseId } = student;
    const courseInfo = user.courses?.[courseId];
    const currentMentorId = user.courses?.[courseId]?.mentorId;

    if (courseInfo?.roles.includes(CourseRole.Manager)) {
      return true;
    }

    if (student.mentorId == null) {
      return false;
    }

    return student.mentorId === currentMentorId;
  }
}
