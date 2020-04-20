import { AbstractRepository, EntityRepository, getRepository } from 'typeorm';
import { MentorBasic } from '../../../common/models';
import { Mentor } from '../models';
import { userService } from '../services';

@EntityRepository(Mentor)
export class MentorRepository extends AbstractRepository<Mentor> {
  public async findActive(courseId: number) {
    const mentors = await this.getPreparedMentorQuery()
      .where('mentor.courseId = :courseId', { courseId })
      .andWhere('mentor.isExpelled = false')
      .getMany();
    return mentors.map(transformMentor);
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

  private getPreparedMentorQuery() {
    return getRepository(Mentor)
      .createQueryBuilder('mentor')
      .select(['mentor.id', 'mentor.isExpelled', 'mentor.userId'])
      .innerJoin('mentor.user', 'mUser')
      .addSelect([...this.getPrimaryUserFields('mUser')]);
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
    students: [],
  };
}
