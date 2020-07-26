import { AbstractRepository, EntityRepository } from 'typeorm';
import { Feedback } from '../models';
import { IGratitudeGetRequest } from '../../../common/interfaces/gratitude';

@EntityRepository(Feedback)
export class FeedbackRepository extends AbstractRepository<Feedback> {
  public async getGratitude({
    courseId,
    githubId,
    // limit = 20,
    // page = 1,
    name,
  }: IGratitudeGetRequest) {
    const query = this.createQueryBuilder('feedback').select('COUNT("badgeId") AS "badges"');

    query
      .innerJoin('feedback.toUser', 'user')
      .addSelect('user.githubId', 'githubId')
      .addSelect('user.firstName', 'firstName')
      .addSelect('user.lastName', 'lastName')
      .addSelect('user.countryName', 'countryName')
      .addSelect('user.cityName', 'cityName')
      .addSelect('user.activist', 'activist')
      .addSelect('user.id', 'user_id');

    if (githubId) {
      query.andWhere('"githubId" ILIKE :githubId', {
        githubId: `%${githubId}%`,
      });
    }

    if (name) {
      query.andWhere('"user"."firstName" ILIKE :searchText OR "user"."lastName" ILIKE :searchText', {
        searchText: `%${name}%`,
      });
    }

    if (courseId) {
      query
        .addSelect('"feedback"."courseId"', 'courseId')
        .andWhere('"courseId" = :courseId', {
          courseId,
        })
        .addGroupBy('"courseId"');
    }

    query
      .groupBy('"githubId"')
      .addGroupBy('"courseId"')
      .addGroupBy('"firstName"')
      .addGroupBy('"lastName"')
      .addGroupBy('"countryName"')
      .addGroupBy('"cityName"')
      .addGroupBy('"activist"')
      .addGroupBy('"user_id"')
      .orderBy('badges', 'DESC');

    return (
      query
        // .limit(limit)
        // .offset((page - 1) * limit)
        .getRawMany()
    );
  }
}
