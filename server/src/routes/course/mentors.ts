import Router from '@koa/router';
import { NOT_FOUND, OK } from 'http-status-codes';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { Mentor } from '../../models';
import { courseService, OperationResult, userService } from '../../services';
import { setResponse } from '../utils';

export const getMentors = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const result = await courseService.getMentors(courseId);
  setResponse(ctx, OK, result);
};

export const getMentorsDetails = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const result = await courseService.getMentorsDetails(courseId);
  setResponse(ctx, OK, result);
};

export const createMentors = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const data: { githubId: string; maxStudentsLimit: number }[] = ctx.request.body;
  const mentorRepository = getRepository(Mentor);

  if (data === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const result: OperationResult[] = [];
  for await (const item of data) {
    const { githubId, maxStudentsLimit } = item;

    const user = await userService.getUserByGithubId(item.githubId);

    if (user == null) {
      result.push({ status: 'skipped', value: githubId });
      continue;
    }

    const exists =
      (await getRepository(Mentor)
        .createQueryBuilder('mentor')
        .innerJoinAndSelect('mentor.user', 'user')
        .innerJoinAndSelect('mentor.course', 'course')
        .where('user.id = :userId AND course.id = :courseId', {
          userId: user.id,
          courseId,
        })
        .getCount()) > 0;

    if (exists) {
      result.push({
        status: 'skipped',
        value: item.githubId,
      });
      continue;
    }

    const mentor: Partial<Mentor> = { user, maxStudentsLimit, courseId };
    const savedMentor = await mentorRepository.save(mentor);

    result.push({
      status: 'created',
      value: savedMentor.id,
    });
  }

  setResponse(ctx, OK, result);
};

export const searchMentors = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);
  const searchText = `${String(ctx.params.searchText)}%`;

  const entities = await getRepository(Mentor)
    .createQueryBuilder('mentor')
    .innerJoin('mentor.user', 'user')
    .addSelect(['user.id', 'user.firstName', 'user.lastName', 'user.githubId'])
    .where('"mentor"."courseId" = :courseId', { courseId })
    .andWhere('"mentor"."isExpelled" = false')
    .andWhere(
      `
        (
          "user"."githubId" ILIKE :searchText OR 
          "user"."firstName" ILIKE :searchText OR 
          "user"."lastName" ILIKE :searchText
        )
      `,
      { courseId, searchText },
    )
    .limit(20)
    .getMany();

  const result = entities.map((entity) => ({
    id: entity.id,
    githubId: entity.user.githubId,
    name: userService.createName(entity.user),
  }));

  setResponse(ctx, OK, result, 60);
};
