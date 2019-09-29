import { OK } from 'http-status-codes';
import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { CourseEvent } from '../../models';
import { setResponse } from '../utils';

export const getCourseEvents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;

  const data = await getRepository(CourseEvent)
    .createQueryBuilder('courseEvent')
    .innerJoinAndSelect('courseEvent.event', 'event')
    .innerJoin('courseEvent.stage', 'stage')
    .leftJoin('courseEvent.organizer', 'organizer')
    .addSelect([
      'stage.id',
      'stage.name',
      'organizer.id',
      'organizer.firstName',
      'organizer.lastName',
      'organizer.githubId',
    ])
    .where('courseEvent.courseId = :courseId', { courseId })
    .getMany();

  setResponse(ctx, OK, data);
};
