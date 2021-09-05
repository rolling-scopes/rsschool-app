import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { getRepository } from 'typeorm';
import { ILogger } from '../../../logger';
import { Mentor } from '../../../models';
import { userService } from '../../../services';
import { setResponse } from '../../utils';

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

  const result = entities.map(entity => ({
    id: entity.id,
    githubId: entity.user.githubId,
    name: userService.createName(entity.user),
  }));

  setResponse(ctx, StatusCodes.OK, result, 60);
};
