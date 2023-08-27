import { AbstractRepository, EntityRepository, getRepository } from 'typeorm';
import { MentorBasic } from '../../../common/models';
import { Mentor } from '../models';
import { userService } from '../services';

@EntityRepository(Mentor)
export class MentorRepository extends AbstractRepository<Mentor> {
  public async findActive(courseId: number, selectStudents = false) {
    let query = this.getPreparedMentorQuery(selectStudents)
      .where('mentor.courseId = :courseId', { courseId })
      .andWhere('mentor.isExpelled = false');
    if (selectStudents) {
      query = query.andWhere('students.isExpelled = false');
    }
    const result = await query.getMany();
    return result.map(transformMentor);
  }

  public async findByGithubId(courseId: number, githubId: string) {
    const query = this.getPreparedMentorQuery()
      .where('mentor.courseId = :courseId', { courseId })
      .andWhere('mUser.githubId = :githubId', { githubId });
    const result = await query.getOne();
    return result ? transformMentor(result) : null;
  }

  public async findActiveWithStudentsLimit(courseId: number) {
    const query = this.getPreparedMentorQuery(true)
      .addSelect('mentor.maxStudentsLimit')
      .where('mentor.courseId = :courseId', { courseId })
      .andWhere('mentor.isExpelled = false')
      .andWhere('(students.isExpelled = false OR students IS NULL)');
    const result = await query.getMany();
    return result.map(transformMentorWithStudentsLimit);
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

  private getPreparedMentorQuery(selectStudents = false) {
    let query = getRepository(Mentor)
      .createQueryBuilder('mentor')
      .select(['mentor.id', 'mentor.isExpelled', 'mentor.userId'])
      .innerJoin('mentor.user', 'mUser')
      .leftJoin('mentor.students', 'students')
      .addSelect([...this.getPrimaryUserFields('mUser')]);
    if (selectStudents) {
      query = query.addSelect(['students.id', 'students.courseId']);
    }
    return query;
  }
}

function transformMentor(record: Mentor): MentorBasic {
  return {
    id: record.id,
    name: userService.createName(record.user),
    githubId: record.user.githubId,
    cityName: record.user.cityName ?? 'Unknown',
    countryName: record.user.countryName ?? 'Unknown',
    isActive: !record.isExpelled,
    students: record.students?.map(s => ({ id: s.id })) ?? [],
  };
}

function transformMentorWithStudentsLimit(record: Mentor): MentorBasic & { maxStudentsLimit: number } {
  return {
    ...transformMentor(record),
    maxStudentsLimit: record.maxStudentsLimit ?? 0,
  };
}
