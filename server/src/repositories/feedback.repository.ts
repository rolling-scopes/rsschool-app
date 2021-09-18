import { AbstractRepository, EntityRepository, getManager } from 'typeorm';
import { Feedback } from '../models';
import { IGratitudeGetRequest } from '../../../common/interfaces/gratitude';

@EntityRepository(Feedback)
export class FeedbackRepository extends AbstractRepository<Feedback> {
  public async getGratitude({ courseId, githubId, name, pageSize = 20, current = 1 }: IGratitudeGetRequest) {
    const count = await getManager()
      .createQueryBuilder()
      .select('COUNT(*)')
      .from(qb => {
        const query = qb
          .subQuery()
          .from(Feedback, 'feedback')
          .select('"user"."id"', 'user_id')
          .innerJoin('feedback.toUser', 'user')
          .innerJoin('feedback.fromUser', 'fromUser');

        if (githubId) {
          query.andWhere('"user"."githubId" ILIKE :githubId', {
            githubId: `%${githubId}%`,
          });
        }

        if (name) {
          query.andWhere('"user"."firstName" ILIKE :searchText OR "user"."lastName" ILIKE :searchText', {
            searchText: `%${name}%`,
          });
        }

        if (courseId) {
          query.andWhere('"feedback"."courseId" = :courseId', {
            courseId,
          });
        }

        return query.groupBy('"user_id"');
      }, 'u')
      .getRawOne();

    if (!count.count || Number(count.count) === 0) {
      return {
        count: 0,
        content: [],
      };
    }

    const query = this.createQueryBuilder('feedback')
      .select('feedback.badgeId', 'badgeId')
      .addSelect('feedback.updatedDate', 'date')
      .addSelect('feedback.comment', 'comment')
      .addSelect('feedback.id', 'id')
      .innerJoin('feedback.toUser', 'user')
      .addSelect('user.githubId', 'githubId')
      .addSelect('user.firstName', 'firstName')
      .addSelect('user.lastName', 'lastName')
      .addSelect('user.countryName', 'countryName')
      .addSelect('user.cityName', 'cityName')
      .addSelect('user.activist', 'activist')
      .addSelect('user.id', 'user_id')
      .innerJoin('feedback.fromUser', 'fromUser')
      .addSelect(
        'json_build_object(\'githubId\', "fromUser"."githubId", \'firstName\', "fromUser"."firstName", \'lastName\', "fromUser"."lastName")',
        'from',
      );

    if (githubId) {
      query.andWhere('"user"."githubId" ILIKE :githubId', {
        githubId: `%${githubId}%`,
      });
    }

    if (name) {
      query.andWhere('"user"."firstName" ILIKE :searchText OR "user"."lastName" ILIKE :searchText', {
        searchText: `%${name}%`,
      });
    }

    if (courseId) {
      query.addSelect('"feedback"."courseId"', 'courseId').andWhere('"feedback"."courseId" = :courseId', {
        courseId,
      });
    }

    query
      .orderBy('"feedback"."updatedDate"', 'DESC')
      .limit(pageSize)
      .offset((current - 1) * pageSize);

    const content = await query.getRawMany();

    return {
      content,
      count: count.count,
    };
  }
}
