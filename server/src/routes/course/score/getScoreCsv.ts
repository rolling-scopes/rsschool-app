import Router from '@koa/router';
import { ScoreTableFilters } from 'common/types/score';
import { StatusCodes } from 'http-status-codes';
import { parseAsync } from 'json2csv';
import { ILogger } from '../../../logger';
import { IUserSession } from '../../../models';
import { ScoreService } from '../../../services/score';
import { setCsvResponse } from '../../utils';

export const getScoreCsv = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = ctx.params.courseId;
  const user = ctx.state?.user as IUserSession | undefined;
  const { cityName, ['mentor.githubId']: mentor } = ctx.query;

  const filters: ScoreTableFilters = {
    activeOnly: false,
    cityName,
    'mentor.githubId': mentor,
  };

  const service = new ScoreService(courseId, {
    includeContacts: user?.isAdmin ?? false,
  });
  const result = await service.getStudentsScoreForExport(filters);
  const csv = await parseAsync(result, { flatten: true });

  setCsvResponse(ctx, StatusCodes.OK, csv, 'score');
};
