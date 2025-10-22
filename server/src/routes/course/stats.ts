import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { CourseLeaveSurveyResponse } from '../../models';
import Router from '@koa/router';

function getExpelledStats(logger: ILogger) {
  return async (ctx: any) => {
    logger.info('Fetching detailed expelled students statistics');
    const surveyRepository = getRepository(CourseLeaveSurveyResponse);

    try {
      const responses = await surveyRepository.find({
        relations: ['user', 'course'],
      });

      const detailedStats = responses.map(res => ({
        id: res.id,
        course: {
          id: res.course.id,
          name: res.course.name,
          fullName: res.course.fullName,
          alias: res.course.alias,
          description: res.course.description,
          logo: res.course.logo,
        },
        user: {
          id: res.user.id,
          githubId: res.user.githubId,
        },
        reasonForLeaving: res.reasonForLeaving,
        otherComments: res.otherComments,
        submittedAt: res.submittedAt,
      }));

      ctx.status = 200;
      ctx.body = detailedStats;
    } catch (error) {
      logger.error('Failed to fetch detailed expelled students statistics', error);
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  };
}

function deleteExpelledStat(logger: ILogger) {
  return async (ctx: any) => {
    const { id } = ctx.params;
    logger.info(`Deleting expelled student stat with ID: ${id}`);
    const surveyRepository = getRepository(CourseLeaveSurveyResponse);

    try {
      await surveyRepository.delete(id);
      ctx.status = 204;
    } catch (error) {
      logger.error(`Failed to delete expelled student stat with ID: ${id}`, error);
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  };
}

export function expelledStatsRoute(logger: ILogger) {
  const router = new Router();
  router.get('/course/stats/expelled', getExpelledStats(logger));
  router.delete('/course/stats/expelled/:id', deleteExpelledStat(logger));
  return router;
}
