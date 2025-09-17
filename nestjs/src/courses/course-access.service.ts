import { Course } from '@entities/course';
import { Student } from '@entities/student';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, In, Repository } from 'typeorm';
import { AuthUser, CourseRole, Role } from '../auth';

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

  public async getUserAllowedCourseIds(user: AuthUser, ids: number[] = [], year: number): Promise<number[]> {
    const isAdmin = user.appRoles?.includes(Role.Admin);
    const userCourses: number[] = isAdmin ? ids : Object.keys(user?.courses).map(Number);
    const coursesIntersection = ids.filter(id => userCourses.includes(id));

    if (year) {
      // if the year is provided, but the course list
      // is empty, return all courses for the given year
      // for admins and the courses that the user is enrolled
      // in for students.
      const startDate = new Date(year.toString());
      const endDate = new Date((year + 1).toString());

      const condition: FindOptionsWhere<Course> = { startDate: Between(startDate, endDate) };

      if (!isAdmin) {
        condition.id = In(userCourses);
      }

      const courses = await this.courseRepository.find({
        where: condition,
        select: ['id'],
      });

      return courses.map(({ id }) => id);
    }

    return coursesIntersection;
  }

  public canAccessCourseAsManager(user: AuthUser, courseId: number): boolean {
    return user.courses[courseId]?.roles.includes(CourseRole.Manager) || user.isAdmin;
  }

  public async leaveAsStudent(courseId: number, studentId: number, comment?: string): Promise<void> {
    const [student, course] = await Promise.all([
      this.studentRepository.findOneByOrFail({ id: studentId }),
      this.courseRepository.findOneByOrFail({ id: courseId }),
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
      this.studentRepository.findOneByOrFail({ id: studentId }),
      this.courseRepository.findOneByOrFail({ id: courseId }),
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
