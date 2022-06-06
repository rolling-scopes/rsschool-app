import { Course } from '@entities/course';
import { Student } from '@entities/student';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser, Role } from '../auth';

// use this as a mark for identifying self-expelled students.
const SELF_EXPELLED_MARK = 'Self expelled from the course';

@Injectable()
export class CourseAccessService {
  constructor(
    @InjectRepository(Student)
    readonly studentRepository: Repository<Student>,
    @InjectRepository(Course)
    readonly courseRepository: Repository<Course>,
  ) {}

  public async canAccessCourse(user: AuthUser, courseId: number): Promise<boolean> {
    if (user.appRoles?.includes(Role.Admin)) {
      return true;
    }

    return !!user.courses[courseId];
  }

  public async leaveAsStudent(courseId: number, studentId: number, comment?: string): Promise<void> {
    const [student, course] = await Promise.all([
      this.studentRepository.findOneOrFail(studentId),
      this.courseRepository.findOneOrFail(courseId),
    ]);

    if (course.completed) throw new BadRequestException('Course is already completed');
    if (student.isExpelled) throw new BadRequestException('Student is not active');

    await this.studentRepository.update(student.id, {
      mentorId: null,
      isExpelled: true,
      expellingReason: `${SELF_EXPELLED_MARK}. ${comment || ''}`,
      endDate: new Date(),
    });
  }

  public async rejoinAsStudent(courseId: number, studentId: number): Promise<void> {
    const [student, course] = await Promise.all([
      this.studentRepository.findOneOrFail(studentId),
      this.courseRepository.findOneOrFail(courseId),
    ]);

    if (course.completed) throw new BadRequestException('Course is already completed');
    if (!student.isExpelled) throw new BadRequestException('Student is active');

    if (!student.expellingReason?.startsWith(SELF_EXPELLED_MARK)) {
      throw new BadRequestException('Student is not expelled by self');
    }

    await this.studentRepository.update(student.id, {
      isExpelled: false,
      expellingReason: 'Re-joined course',
      endDate: null,
    });
  }
}
