import { getRepository } from 'typeorm';
import { PublicFeedback } from '../../../../common/models/profile';
import { getFullName } from '../../rules';
import { User, Feedback } from '../../models';

export const getPublicFeedback = async (githubId: string): Promise<PublicFeedback[]> =>
  (
    await getRepository(Feedback)
      .createQueryBuilder('feedback')
      .select('"feedback"."updatedDate" AS "feedbackDate"')
      .addSelect('"feedback"."badgeId" AS "badgeId"')
      .addSelect('"feedback"."comment" AS "comment"')
      .addSelect('"feedback"."heroesUrl" AS "heroesUri"')
      .addSelect('"fromUser"."firstName" AS "fromUserFirstName", "fromUser"."lastName" AS "fromUserLastName"')
      .addSelect('"fromUser"."githubId" AS "fromUserGithubId"')
      .leftJoin(User, 'user', '"user"."id" = "feedback"."toUserId"')
      .leftJoin(User, 'fromUser', '"fromUser"."id" = "feedback"."fromUserId"')
      .where('"user"."githubId" = :githubId', { githubId })
      .orderBy('"feedback"."updatedDate"', 'DESC')
      .getRawMany()
  ).map(
    ({ feedbackDate, badgeId, comment, heroesUri, fromUserFirstName, fromUserLastName, fromUserGithubId }: any) => ({
      feedbackDate,
      badgeId,
      comment,
      heroesUri,
      fromUser: {
        name: getFullName(fromUserFirstName, fromUserLastName, fromUserGithubId),
        githubId: fromUserGithubId,
      },
    }),
  );
