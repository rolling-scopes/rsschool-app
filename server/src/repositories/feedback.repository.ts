import { AbstractRepository, EntityRepository, getManager } from 'typeorm';
import { Feedback, User } from '../models';
import { IGratitudeGetRequest } from '../../../common/interfaces/gratitude';

@EntityRepository(Feedback)
export class FeedbackRepository extends AbstractRepository<Feedback> {
  public async getGratitude({ courseId, githubId, name, pageSize = 20, current = 1 }: IGratitudeGetRequest) {
    const queryCount = getManager()
      .createQueryBuilder()
      .select('COUNT(*)')
      .from(Feedback, 'feedback')
      .innerJoin('feedback.toUser', 'user')
      .innerJoin('feedback.fromUser', 'fromUser');

    if (githubId) {
      queryCount.andWhere('"user"."githubId" ILIKE :githubId', {
        githubId: `%${githubId}%`,
      });
    }

    if (name) {
      queryCount.andWhere(
        '"user"."firstName" ILIKE :searchText OR "user"."lastName" ILIKE :searchText OR CONCAT("user"."firstName", \' \', "user"."lastName") ILIKE :searchText',
        {
          searchText: `%${name}%`,
        },
      );
    }

    if (courseId) {
      queryCount.andWhere('"feedback"."courseId" = :courseId', {
        courseId,
      });
    }

    const count = await queryCount.getRawOne();

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
      query.andWhere(
        '"user"."firstName" ILIKE :searchText OR "user"."lastName" ILIKE :searchText OR CONCAT("user"."firstName", \' \', "user"."lastName") ILIKE :searchText',
        {
          searchText: `%${name}%`,
        },
      );
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

  public async getResumeFeedback(githubId: string) {
    return await this.createQueryBuilder('feedback')
      .select('"feedback"."updatedDate" AS "feedbackDate"')
      .addSelect('"feedback"."comment" AS "comment"')
      .leftJoin(User, 'user', '"user"."id" = "feedback"."toUserId"')
      .where('"user"."githubId" = :githubId', { githubId })
      .orderBy('"feedback"."updatedDate"', 'DESC')
      .getRawMany();
  }

  public async getApplicantFeedback(githubId: string) {
    return await this.createQueryBuilder('feedback')
      .select('"feedback"."badgeId" AS "badgeId"')
      .leftJoin(User, 'user', '"user"."id" = "feedback"."toUserId"')
      .where('"user"."githubId" = :githubId', { githubId })
      .orderBy('"feedback"."updatedDate"', 'DESC')
      .getMany();
  }
}
