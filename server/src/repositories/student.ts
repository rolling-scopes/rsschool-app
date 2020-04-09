import { EntityRepository, AbstractRepository, getRepository } from 'typeorm';
import { Student } from '../models';
import { userService, courseService } from '../services';
import { StudentBasic, UserBasic } from '../../../common/models';

@EntityRepository(Student)
export class StudentRepository extends AbstractRepository<Student> {
  public async expel(courseId: number, githubId: string, comment = '') {
    const student = await this.findByGithubId(courseId, githubId);
    if (student == null) {
      return;
    }
    await getRepository(Student).update(student.id, {
      mentorId: null,
      isExpelled: true,
      expellingReason: comment || '',
      endDate: new Date(),
    });
  }

  public async restore(courseId: number, githubId: string) {
    const student = await this.findByGithubId(courseId, githubId);
    if (student == null) {
      return;
    }
    await getRepository(Student).update(student.id, {
      isExpelled: false,
      expellingReason: '',
      endDate: null,
    });
  }

  public async setMentor(courseId: number, studentGithubId: string, mentorGithubId: string | null) {
    const student = await this.findByGithubId(courseId, studentGithubId);
    if (student == null) {
      return;
    }
    let mentor: any = null;
    if (mentorGithubId) {
      mentor = await courseService.getMentorByGithubId(courseId, mentorGithubId);
      if (mentor == null) {
        return;
      }
    }
    await getRepository(Student).update(student.id, { mentorId: mentor ? mentor.id : null });
  }

  public async search(courseId: number, searchText: string): Promise<UserBasic[]> {
    const searchQuery = `${searchText}%`;

    const entities = await getRepository(Student)
      .createQueryBuilder('student')
      .select([
        `student.id AS "id"`,
        `user.githubId AS "githubId"`,
        `user.firstName AS "firstName"`,
        `user.lastName AS "lastName"`,
      ])
      .leftJoin('student.user', 'user')
      .where('student.courseId = :courseId')
      .andWhere('student.isExpelled = false')
      .andWhere(
        `(
          user.githubId ILIKE :searchQuery OR 
          user.firstName ILIKE :searchQuery OR
          user.lastName ILIKE :searchQuery
        )`,
        { courseId, searchQuery },
      )
      .limit(20)
      .getRawMany();

    return entities.map(entity => ({ id: entity.id, githubId: entity.githubId, name: userService.createName(entity) }));
  }

  public async findAndIncludeMentor(courseId: number, githubId: string): Promise<StudentBasic | null> {
    const record = await this.getPreparedStudentQuery()
      .where('sUser.githubId = :githubId', { githubId })
      .andWhere('student.courseId = :courseId', { courseId })
      .getOne();

    if (record == null) {
      return null;
    }
    return {
      id: record.id,
      name: userService.createName(record.user),
      githubId: record.user.githubId,
      cityName: record.user.cityName ?? '',
      countryName: record.user.countryName ?? '',
      isActive: !record.isExpelled && !record.isFailed,
      mentor: record.mentor
        ? {
            id: record.mentor.id,
            name: userService.createName(record.mentor.user),
            githubId: record.mentor.user.githubId,
            cityName: record.mentor.user.cityName,
            countryName: record.mentor.user.countryName,
            isActive: !record.mentor.isExpelled,
          }
        : null,
    };
  }

  public async findAndIncludeDetails(courseId: number, githubId: string) {
    const query = getRepository(Student)
      .createQueryBuilder('student')
      .innerJoin('student.user', 'sUser')
      .leftJoin('student.mentor', 'mentor')
      .leftJoin('mentor.user', 'mUser')
      .addSelect([
        'mentor.id',
        'mentor.isExpelled',
        'mentor.userId',
        ...this.getPrimaryUserFields('sUser'),
        ...this.getPrimaryUserFields('mUser'),
      ])
      .where('sUser.githubId = :githubId', { githubId })
      .andWhere('student.courseId = :courseId', { courseId });

    const record = await query.getOne();
    if (record == null) {
      return null;
    }

    return {
      ...transformStudent(record),
      expellingReason: record.expellingReason,
      totalScore: record.totalScore,
    };
  }

  public async findByMentor(courseId: number, githubId: string): Promise<StudentBasic[]> {
    const records = await this.getPreparedStudentQuery()
      .where('mUser.githubId = :githubId', { githubId })
      .andWhere('student.isExpelled = false')
      .andWhere('student.courseId = :courseId ', { courseId })
      .getMany();

    const students = records.map(transformStudent);
    return students;
  }

  private async findByGithubId(courseId: number, githubId: string): Promise<UserBasic | null> {
    const record = await getRepository(Student)
      .createQueryBuilder('student')
      .select(['student.id'])
      .innerJoin('student.user', 'user')
      .addSelect(['user.firstName', 'user.lastName', 'user.githubId'])
      .where('user.githubId = :githubId', { githubId })
      .andWhere('student.courseId = :courseId', { courseId })
      .getOne();
    if (record == null) {
      return null;
    }
    return {
      id: record.id,
      name: userService.createName(record.user),
      githubId: record.user.githubId,
    };
  }

  private getPrimaryUserFields(modelName = 'user') {
    return [
      `${modelName}.id`,
      `${modelName}.firstName`,
      `${modelName}.lastName`,
      `${modelName}.githubId`,
      `${modelName}.cityName`,
      `${modelName}.countryName`,
    ];
  }

  private getPreparedStudentQuery() {
    return getRepository(Student)
      .createQueryBuilder('student')
      .select(['student.id', 'student.isExpelled', 'student.mentorId', 'student.isFailed'])
      .innerJoin('student.user', 'sUser')
      .innerJoin('student.mentor', 'mentor')
      .innerJoin('mentor.user', 'mUser')
      .addSelect([
        'mentor.id',
        'mentor.isExpelled',
        'mentor.userId',
        ...this.getPrimaryUserFields('sUser'),
        ...this.getPrimaryUserFields('mUser'),
      ]);
  }
}

function transformStudent(record: Student): StudentBasic {
  return {
    id: record.id,
    name: userService.createName(record.user),
    githubId: record.user.githubId,
    cityName: record.user.cityName ?? 'Unknown',
    countryName: record.user.countryName ?? 'Unknown',
    isActive: !record.isExpelled && !record.isFailed,
    mentor: record.mentor
      ? {
          id: record.mentor.id,
          name: userService.createName(record.mentor.user),
          githubId: record.mentor.user.githubId,
          cityName: record.mentor.user.cityName,
          countryName: record.mentor.user.countryName,
          isActive: !record.mentor.isExpelled,
        }
      : null,
  };
}
