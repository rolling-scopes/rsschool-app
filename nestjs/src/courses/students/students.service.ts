import { Student } from '@entities/student';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser, Role, CourseRole } from '../../auth';
import { Repository } from 'typeorm';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    readonly studentRepository: Repository<Student>,
  ) {}

  public getById(id: number) {
    return this.studentRepository.findOne(id, {
      relations: ['user'],
    });
  }

  public getByMentorId(mentorId: number) {
    return this.studentRepository.find({
      where: { mentorId },
      relations: ['user', 'feedbacks'],
    });
  }

  public async canAccessStudent(user: AuthUser, studentId: number): Promise<boolean> {
    const student = await this.getById(studentId);
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
