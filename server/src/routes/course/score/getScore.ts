import Router from '@koa/router';
import { OK } from 'http-status-codes';
import NodeCache from 'node-cache';
import { ILogger } from '../../../logger';
import { ScoreService } from '../../../services/score.service';
import { setResponse } from '../../utils';

const memoryCache = new NodeCache({ stdTTL: 120, checkperiod: 150 });

export const getScore = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = ctx.params.courseId;
  const orderBy = ctx.query.orderBy ?? 'totalScore';
  const orderDirection = ctx.query.orderDirection?.toUpperCase() ?? 'DESC';
  const pagination = {
    current: ctx.state.pageable.current,
    pageSize: ctx.state.pageable.pageSize,
  };
  const filter = {
    ...ctx.query,
    activeOnly: ctx.query.activeOnly === 'true',
  };

  const cacheKey = `${courseId}_score_${JSON.stringify({ pagination, filter, orderBy, orderDirection })}`;

  const cachedData = memoryCache.get(cacheKey);
  if (cachedData) {
    logger.info(`[Cache]: Score for ${courseId}`);
    setResponse(ctx, OK, cachedData, 120);
    return;
  }

  const service = new ScoreService(courseId);
  const students = await service.getStudentsScore(pagination, filter, { field: orderBy, direction: orderDirection });
  memoryCache.set(cacheKey, students);
  setResponse(ctx, OK, students, 120);
};
