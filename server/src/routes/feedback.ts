import { BAD_REQUEST, OK } from 'http-status-codes';
import Router from '@koa/router';
import { getCustomRepository, getRepository } from 'typeorm';
import { DiscordService, HeroesService } from '../integrations';
import { ILogger } from '../logger';
import { Feedback, IUserSession, PrivateFeedback, User } from '../models';
import { guard } from './guards';
import { setResponse } from './utils';
import { FeedbackRepository } from '../repositories/feedback.repository';
import { IGratitudeGetRequest } from '../../../common/interfaces/gratitude';
import { courseService } from '../services';

type GratitudeInput = { toUserId: number; comment: string; badgeId?: string; courseId: number };
type FeedbackInput = { toUserId: number; comment: string };

export function feedbackRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/feedback' });
  router.post('/private', guard, postPrivateFeedback(logger));
  router.post('/gratitude', guard, postGratitudeFeedback(logger));
  router.get('/gratitude', guard, getGratitudeFeedback());
  return router;
}

const postPrivateFeedback = (_: ILogger) => {
  return async (ctx: Router.RouterContext) => {
    const courseId: number = ctx.params.courseId;
    const data: FeedbackInput = ctx.request.body;
    const id = ctx.state.user.id;

    if (isNaN(data.toUserId) || data.toUserId === id) {
      setResponse(ctx, BAD_REQUEST);
      return;
    }

    const feedback: Partial<PrivateFeedback> = {
      comment: data.comment,
      course: courseId,
      fromUser: id,
      toUser: data.toUserId,
    };
    const result = await getRepository(PrivateFeedback).save(feedback);

    setResponse(ctx, OK, result);
    return;
  };
};

const isValidName = (name: string) => typeof name === 'string' && name.trim().length > 0;

const getUserDisplayName = (data: User) => {
  let name = data.githubId;
  if (isValidName(data.firstName) || isValidName(data.lastName)) {
    name = `${data.firstName} ${data.lastName}`;
  }
  return name;
};

const postGratitudeFeedback = (logger: ILogger) => {
  const heroesService = new HeroesService(logger);
  const discordService = new DiscordService(logger);

  type Badge = { id: string; name: string; isManagerOnly: boolean };

  const heroBadges: Badge[] = [
    { id: 'Congratulations', name: 'Congratulations', isManagerOnly: false },
    { id: 'Expert_help', name: 'Expert help', isManagerOnly: false },
    { id: 'Great_speaker', name: 'Great speaker', isManagerOnly: false },
    { id: 'Good_job', name: 'Good job', isManagerOnly: false },
    { id: 'Helping_hand', name: 'Helping hand', isManagerOnly: false },
    { id: 'Hero', name: 'Hero', isManagerOnly: false },
    { id: 'Thank_you', name: 'Thank you', isManagerOnly: false },
    { id: 'Outstanding_work', name: 'Outstanding work', isManagerOnly: true },
    { id: 'Top_performer', name: 'Top performer', isManagerOnly: true },
  ];

  const rolesForSpecialBadges = ['manager', 'supervisor'];

  const getAvailableBadges = ({ coursesRoles }: IUserSession, id: number) => {
    const userCourseRoles = coursesRoles ? coursesRoles[id] : [];
    const isAvailableSpecialBadges = [...(userCourseRoles ?? [])].some(role => rolesForSpecialBadges.includes(role));

    return heroBadges.filter((badge: Badge) => (!badge.isManagerOnly ? true : isAvailableSpecialBadges ? true : false));
  };

  const postToHeroes = (fromUser: User | undefined, toUser: User | undefined, data: GratitudeInput) => {
    if (
      !fromUser ||
      !fromUser.primaryEmail ||
      !toUser ||
      !toUser.primaryEmail ||
      !data.badgeId ||
      !heroesService.isCommentValid(data.comment)
    ) {
      return Promise.resolve(null);
    }
    return heroesService.assignBadge({
      assignerEmail: fromUser.primaryEmail,
      assignerName: getUserDisplayName(fromUser),
      receiverEmail: toUser!.primaryEmail,
      receiverName: getUserDisplayName(toUser),
      comment: data.comment,
      event: data.badgeId,
    });
  };

  const postToDiscord = (
    fromUser: User | undefined,
    toUser: User | undefined,
    data: GratitudeInput,
    gratitudeUrl?: string,
  ) => {
    if (!fromUser || !toUser || !data.comment || !gratitudeUrl) {
      logger.info('No fromUser or toUser or comment or gratitudeUrl');
      return Promise.resolve(null);
    }
    return discordService.pushGratitude({
      toGithubId: toUser.githubId,
      toDiscordId: toUser.discord?.id ?? null,
      fromGithubId: fromUser.githubId,
      comment: data.comment,
      gratitudeUrl: gratitudeUrl,
    });
  };

  return async (ctx: Router.RouterContext) => {
    const data: GratitudeInput = ctx.request.body;
    const id = ctx.state.user.id;

    const supportedBadgesIds = getAvailableBadges(ctx.state.user, data.courseId).map(({ id }) => id);

    if (isNaN(data.toUserId) || (data.badgeId && !supportedBadgesIds.includes(data.badgeId)) || data.toUserId === id) {
      setResponse(ctx, BAD_REQUEST);
      return;
    }

    const userRepository = getRepository(User);
    const [fromUser, toUser] = await Promise.all([userRepository.findOne(id), userRepository.findOne(data.toUserId)]);

    const heroesUrl = (await postToHeroes(fromUser, toUser, data)) ?? undefined;
    const course = await courseService.getCourse(data.courseId);

    await postToDiscord(fromUser, toUser, data, course?.discordServer.gratitudeUrl);
    const feedback: Partial<Feedback> = {
      comment: data.comment,
      badgeId: data.badgeId ? data.badgeId : undefined,
      course: data.courseId ? data.courseId : undefined,
      fromUser: id,
      toUser: data.toUserId,
      heroesUrl,
    };
    const result = await getRepository(Feedback).save(feedback);

    setResponse(ctx, OK, result);
    return;
  };
};

const getGratitudeFeedback = () => {
  return async (ctx: Router.RouterContext) => {
    const data: IGratitudeGetRequest = ctx.query;
    const feedbackRepository = getCustomRepository(FeedbackRepository);
    const result = await feedbackRepository.getGratitude(data);
    setResponse(ctx, OK, result);
    return;
  };
};
