import { Injectable, Logger } from '@nestjs/common';
import { CoursesService } from 'src/courses/courses.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@entities/user';
import { Repository } from 'typeorm';
import { Course } from '@entities/course';
import { Student } from '@entities/student';
import { Mentor } from '@entities/mentor';
import { CourseUser } from '@entities/courseUser';

type UserCourses = [number, Course[]];
type Recipients = UserCourses[];

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger('schedule');
  constructor(
    private courseService: CoursesService,
    @InjectRepository(User)
    readonly userRepository: Repository<User>,
  ) {}

  public async getChangedCoursesRecipients(): Promise<Recipients> {
    const updatedCourses = await this.courseService.getCoursesWithUpdateScheduleWithin(1);
    const aliasMap = new Map(updatedCourses.map(course => [course.alias, course]));

    this.logger.log({ message: `updated courses: ${updatedCourses.map(course => course.name)} ` });
    if (!updatedCourses.length) return [];

    const users: {
      id: number;
      aliases: string[];
    }[] = await this.userRepository
      .createQueryBuilder('user')
      .select('user.id', 'id')
      .addSelect(`array_remove(array_agg(DISTINCT course."alias"), NULL)`, 'aliases')
      .leftJoin(
        Student,
        'student',
        'user.id = student.userId and student.isExpelled = false and student.courseId In (:...courseIds)',
        {
          courseIds: updatedCourses.map(c => c.id),
        },
      )
      .leftJoin(
        Mentor,
        'mentor',
        'user.id = mentor.userId and mentor.isExpelled = false and mentor.courseId In (:...courseIds)',
        {
          courseIds: updatedCourses.map(c => c.id),
        },
      )
      .leftJoin(
        CourseUser,
        'courseUser',
        'user.id = courseUser.userId and courseUser.courseId In (:...courseIds) and courseUser.isManager = true',
        {
          courseIds: updatedCourses.map(c => c.id),
        },
      )
      .innerJoin(
        Course,
        'course',
        '(mentor.courseId = course.id or student.courseId = course.id or courseUser.courseId = course.id)',
      )

      .groupBy('user.id')
      .getRawMany();

    return users
      .filter(user => user.aliases.length > 0)
      .map(user => [user.id, user.aliases.map((course: string) => aliasMap.get(course) as Course)]);
  }
}
