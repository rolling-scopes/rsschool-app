import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { parseAsync, transforms } from 'json2csv';
import { ILogger } from '../../../logger';
import { IUserSession, CourseRole } from '../../../models';
import { ScoreService } from '../../../services/score';
import { setCsvResponse } from '../../utils';

export const getScoreCsv = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = ctx.params.courseId;
  const user = ctx.state?.user as IUserSession | undefined;
  const { cityName, ['mentor.githubId']: mentor } = ctx.query;
  const isCourseManager = user?.courses[courseId]?.roles?.includes(CourseRole.Manager);

  const filters = {
    activeOnly: false,
    cityName,
    'mentor.githubId': mentor,
  };

  const service = new ScoreService(courseId, {
    includeContacts: (user?.isAdmin || user?.isHirer) ?? false,
    includeCertificate: (user?.isAdmin || user?.isHirer || isCourseManager) ?? false,
  });
  const result = await service.getStudentsScoreForExport(filters);
  const csv = await parseAsync(result, { transforms: [transforms.flatten()] });

  setCsvResponse(ctx, StatusCodes.OK, csv, 'score');
};
