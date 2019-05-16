import * as Router from 'koa-router';
import { getRepository } from 'typeorm';
import { OK, BAD_REQUEST } from 'http-status-codes';
import { setResponse } from '../utils';
import { Feedback, User } from '../../models';
import { ILogger } from '../../logger';
import { HeroesService } from '../../integrations/heroes';

type FeedbackInput = {
  toUserId: number;
  comment: string;
  badgeId?: string;
};

const getUserDisplayName = (data: User) => {
  if (data.firstName || data.lastName) {
    return `${data.firstName} ${data.lastName}`;
  }
  return data.githubId;
};

const SUPPORTED_BADGE_IDS = [
  'Congratulations',
  'Expert_help',
  'Great_speaker',
  'Good_job',
  'Helping_hand',
  'Hero',
  'Thank_you',
];

export const postFeedback = (logger: ILogger) => {
  const heroesService = new HeroesService(logger);

  const postToHeroes = (fromUser: User | undefined, toUser: User | undefined, data: FeedbackInput) => {
    if (
      !fromUser ||
      !fromUser.contactsEmail ||
      !toUser ||
      !toUser.contactsEmail ||
      !data.badgeId ||
      !heroesService.isCommentValid(data.comment)
    ) {
      return Promise.resolve(null);
    }
    return heroesService.assignBadge({
      assignerEmail: fromUser.contactsEmail,
      assignerName: getUserDisplayName(fromUser),
      receiverEmail: toUser!.contactsEmail,
      receiverName: getUserDisplayName(toUser),
      comment: data.comment,
      event: data.badgeId,
    });
  };

  return async (ctx: Router.RouterContext) => {
    const courseId = Number(ctx.params.courseId);
    const data: FeedbackInput = ctx.request.body;

    if (isNaN(courseId) || isNaN(data.toUserId) || (data.badgeId && !SUPPORTED_BADGE_IDS.includes(data.badgeId))) {
      setResponse(ctx, BAD_REQUEST);
      return;
    }

    const id = ctx.state.user.id;
    const userRepository = getRepository(User);
    const [fromUser, toUser] = await Promise.all([userRepository.findOne(id), userRepository.findOne(data.toUserId)]);

    const heroesUrl = await postToHeroes(fromUser, toUser, data);
    const feedback: Partial<Feedback> = {
      comment: data.comment,
      badgeId: data.badgeId ? data.badgeId : undefined,
      course: courseId,
      fromUser: id,
      toUser: data.toUserId,
      heroesUrl: heroesUrl || undefined,
    };
    const result = await getRepository(Feedback).save(feedback);
    setResponse(ctx, OK, result);
    return;
  };
};
