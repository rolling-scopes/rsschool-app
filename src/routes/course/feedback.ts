import * as Router from 'koa-router';
import { getRepository } from 'typeorm';
import { OK, BAD_REQUEST } from 'http-status-codes';
import { setResponse } from '../utils';
import { Feedback, User } from '../../models';
import { ILogger } from '../../logger';
import { HeroesService } from '../../integrations/heroes';

type FeedbackInput = {
  toUserId: number;
  text: string;
  badgeId?: string;
};

const getUserDisplayName = (data: User) => {
  if (data.firstName || data.lastName) {
    return `${data.firstName} ${data.lastName}`;
  }
  return data.githubId;
};

export const postFeedback = (logger: ILogger) => {
  const heroesService = new HeroesService(logger);
  return async (ctx: Router.RouterContext) => {
    const courseId = Number(ctx.params.courseId);
    const data: FeedbackInput = ctx.request.body;

    if (isNaN(courseId) || isNaN(data.toUserId)) {
      setResponse(ctx, BAD_REQUEST);
      return;
    }

    const id = ctx.state.user.id;
    const userRepository = getRepository(User);
    const [fromUser, toUser] = await Promise.all([userRepository.findOne(id), userRepository.findOne(data.toUserId)]);
    const feedback: Partial<Feedback> = {
      text: data.text,
      badgeId: data.badgeId ? data.badgeId : undefined,
      course: courseId,
      fromUser: id,
      toUser: data.toUserId,
    };
    const result = await getRepository(Feedback).save(feedback);

    if (
      fromUser &&
      fromUser.contactsEmail &&
      toUser &&
      toUser.contactsEmail &&
      data.badgeId &&
      heroesService.isCommentValid(data.text)
    ) {
      heroesService.assignBadge({
        assignerEmail: fromUser.contactsEmail,
        assignerName: getUserDisplayName(fromUser),
        receiverEmail: toUser.contactsEmail,
        receiverName: getUserDisplayName(toUser),
        comment: data.text,
        event: data.badgeId,
      });
    }
    setResponse(ctx, OK, result);
  };
};
