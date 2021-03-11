import Router from '@koa/router';
import { OK } from 'http-status-codes';
import omit from 'lodash/omit';
import { ILogger } from '../../../logger';
import { getCrossCheckData } from '../../../services/taskResults.service';
import { setResponse } from '../../utils';

export const getCrossCheckPairs = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId } = ctx.params;
  const orderBy = ctx.query.orderBy ?? 'task';
  const orderDirection = ctx.query.orderDirection?.toUpperCase() ?? 'ASC';
  const pagination = {
    current: ctx.state.pageable.current,
    pageSize: ctx.state.pageable.pageSize,
  };
  const filter = {
    ...omit(ctx.query, ['current', 'pageSize', 'orderBy', 'orderDirection']),
  };

  const { content, pagination: paginationResult } = await getCrossCheckData(
    filter,
    pagination,
    orderBy,
    orderDirection,
    courseId,
  );

  setResponse(ctx, OK, {
    pagination: paginationResult,
    content,
  });
};
