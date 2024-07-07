import { Student } from '@entities/student';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser, Role, CourseRole } from '../../auth';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { StageInterview, User } from '@entities/index';
import { paginate } from 'src/core/paginate';
import { UserStudentsQueryDto } from './dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    readonly studentRepository: Repository<Student>,

    @InjectRepository(StageInterview)
    readonly stageInterviewRepository: Repository<StageInterview>,

    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private buildUserStudentsQuery = (reqQuery: UserStudentsQueryDto): SelectQueryBuilder<User> => {
    let query = this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.students', 'student')
      .innerJoin('student.course', 'course')
      .leftJoin('student.certificate', 'certificate')
      .select(this.getSelectUserStudentFields());

    if (reqQuery.student) {
      this.addStudentSearchConditions(query, reqQuery.student);
    }

    if (reqQuery.country) {
      query.andWhere(`"user"."countryName" ILIKE :country`, { country: `%${reqQuery.country}%` });
    }

    if (reqQuery.city) {
      query.andWhere(`"user"."cityName" ILIKE :city`, { city: `%${reqQuery.city}%` });
    }

    if (reqQuery.ongoingCourses) {
      this.addCourseCondition(query, reqQuery.ongoingCourses, 'onGoingCourseIds');
    }

    if (reqQuery.previousCourses) {
      this.addPreviousCoursesCondition(query, reqQuery.previousCourses);
    }

    const subQuery = query.clone().select('user.id');

    query = this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.students', 'student')
      .innerJoin('student.course', 'course')
      .leftJoin('student.certificate', 'certificate')
      .select(this.getSelectUserStudentFields())
      .where('user.id IN (' + subQuery.getQuery() + ')')
      .setParameters(subQuery.getParameters())
      .addOrderBy('user.id', 'DESC');

    return query;
  };

  private getSelectUserStudentFields(): string[] {
    return [
      'user.id',
      'user.githubId',
      'user.firstName',
      'user.lastName',
      'user.countryName',
      'user.cityName',
      'student.id',
      'student.courseId',
      'course.alias',
      'course.name',
      'course.completed',
      'certificate.publicId',
    ];
  }

  private addStudentSearchConditions(query: SelectQueryBuilder<User>, studentSearch: string): void {
    const searchTerms = studentSearch.split(' ');

    searchTerms.forEach((term, index) => {
      query.andWhere(
        new Brackets(qb => {
          qb.where(`"user"."firstName" ILIKE :searchText${index}`, { [`searchText${index}`]: `%${term}%` })
            .orWhere(`"user"."lastName" ILIKE :searchText${index}`, { [`searchText${index}`]: `%${term}%` })
            .orWhere(`"user"."githubId" ILIKE :searchText${index}`, { [`searchText${index}`]: `%${term}%` });
        }),
      );
    });
  }

  private addCourseCondition(query: SelectQueryBuilder<User>, courseIds: string, paramName: string): void {
    const ids = courseIds.split(',').map(id => parseInt(id));
    query.andWhere(`student.courseId IN (:...${paramName})`, { [paramName]: ids });
  }

  private addPreviousCoursesCondition(query: SelectQueryBuilder<User>, previousCourses: string): void {
    const previousCourseIds = previousCourses.split(',').map(id => parseInt(id));
    query.andWhere(
      new Brackets(qb => {
        qb.where('student.courseId IN (:...previousCourseIds)', { previousCourseIds }).andWhere(
          'certificate.id IS NOT NULL',
        );
      }),
    );
  }

  public async findUserStudents(reqQuery: UserStudentsQueryDto) {
    const page = parseInt(reqQuery.current ?? 1);
    const limit = parseInt(reqQuery.pageSize ?? 20);
    const query = this.buildUserStudentsQuery(reqQuery);
    const data = await paginate(query, { page, limit });
    return data;
  }

  public getById(id: number) {
    return this.studentRepository.findOneOrFail({ where: { id }, relations: ['user'] });
  }

  public async canAccessStudent(user: AuthUser, studentId: number): Promise<boolean> {
    const student = await this.studentRepository.findOneBy({ id: studentId });
    const stageInterviews = await this.stageInterviewRepository.find({ where: { studentId } });
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

    if (courseInfo?.roles.includes(CourseRole.Supervisor)) {
      return true;
    }

    if (stageInterviews.some(interview => interview.mentorId === currentMentorId)) {
      return true;
    }

    if (student.mentorId == null) {
      return false;
    }

    return student.mentorId === currentMentorId;
  }

  /*
   * sets mentor for student, when mentor accepts the student after technical screening
   */
  public async setMentor(studentId: number, mentorId: number) {
    await this.studentRepository.update(studentId, { mentorId });
  }
}
