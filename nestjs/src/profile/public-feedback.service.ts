import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { PublicFeedback } from '@common/models';
import { Feedback, User } from '@entities/index';

@Injectable()
export class PublicFeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,

    private userService: UsersService,
  ) {}

  async getFeedback(githubId: string): Promise<PublicFeedback[]> {
    const records = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('"feedback"."updatedDate" AS "feedbackDate"')
      .addSelect('"feedback"."badgeId" AS "badgeId"')
      .addSelect('"feedback"."comment" AS "comment"')
      .addSelect('"fromUser"."firstName" AS "fromUserFirstName", "fromUser"."lastName" AS "fromUserLastName"')
      .addSelect('"fromUser"."githubId" AS "fromUserGithubId"')
      .leftJoin(User, 'user', '"user"."id" = "feedback"."toUserId"')
      .leftJoin(User, 'fromUser', '"fromUser"."id" = "feedback"."fromUserId"')
      .where('"user"."githubId" = :githubId', { githubId })
      .orderBy('"feedback"."updatedDate"', 'DESC')
      .getRawMany();

    return records.map(
      ({ feedbackDate, badgeId, comment, fromUserFirstName, fromUserLastName, fromUserGithubId }: any) => ({
        feedbackDate,
        badgeId,
        comment,
        fromUser: {
          name:
            this.userService.getFullName({ firstName: fromUserFirstName, lastName: fromUserLastName }) ||
            fromUserGithubId,
          githubId: fromUserGithubId,
        },
      }),
    );
  }
}
