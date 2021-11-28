import { Injectable } from '@nestjs/common';
import { AuthUser, CourseRole, Role } from 'src/auth';
import { MentorsService } from './mentors/mentors.service';
import { StudentsService } from './students';

@Injectable()
export class CourseAccessService {
  constructor(private studentsService: StudentsService, private mentorsService: MentorsService) {}

  public async canAccessStudentFeedback(user: AuthUser, studentId: number): Promise<boolean> {
    if (user.appRoles.includes(Role.Admin)) {
      return true;
    }

    const student = await this.studentsService.getById(studentId);
    if (!student) {
      return false;
    }

    const { courseId } = student;
    const coursesRoles = user.coursesRoles[courseId.toString()];

    if (coursesRoles.includes(CourseRole.Manager)) {
      return true;
    }

    if (coursesRoles.includes(CourseRole.Supervisor)) {
      return true;
    }

    const mentor = await this.mentorsService.getByUserId(courseId, user.id);

    return student.mentorId === mentor.id;
  }
}
